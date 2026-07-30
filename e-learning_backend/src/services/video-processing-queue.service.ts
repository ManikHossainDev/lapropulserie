import { randomUUID } from 'crypto';
import { basename, extname } from 'path';
import mongoose from 'mongoose';
import { Job, Queue, Worker } from 'bullmq';
import { redisConnectionOptions } from '../helpers/redis/redis';
import { TFolderName } from '../enums/folderNames';
import {
  deleteFileByKey,
  downloadFileFromS3,
  getObjectUrlForKey,
  uploadFileToS3,
} from './aws-s3.service';
import { processVideoToHls } from './video-processing.service';
import { errorLogger, logger } from '../shared/logger';
import { JourneyCapsule } from '../modules/journey.module/journey-capsule/journey-capsule.model';
import { JourneyModule } from '../modules/journey.module/journey-module/journey-module.model';
import { JourneyLesson } from '../modules/journey.module/journey-lesson/journey-lesson.model';
import { IndividualLesson } from '../modules/individualCapsule.module/individual-lesson/individual-lesson.model';
import { IndividualCapsule } from '../modules/individualCapsule.module/individual-capsule/individual-capsule.model';

export type VideoProcessingStatus = 'processing' | 'ready' | 'failed';

export interface QueuedVideoInfo {
  url?: string;
  duration?: number;
  status: VideoProcessingStatus;
  errorMessage?: string;
}

export interface StagedVideoUpload {
  token: string;
  folderName: TFolderName;
  sourceKey: string;
  originalname: string;
  mimetype: string;
}

export interface VideoUploadTokenMap {
  [fieldName: string]: string | undefined;
}

export interface VideoSourceReference {
  sourceKey: string;
  originalname?: string;
  mimetype?: string;
}

export type VideoTargetModelName =
  | 'JourneyCapsule'
  | 'JourneyModule'
  | 'JourneyLesson'
  | 'IndividualLesson'
  | 'IndividualCapsule';

interface VideoProcessingJobData {
  token: string;
  folderName: TFolderName;
  sourceKey: string;
  originalname: string;
  mimetype: string;
  targetModel: VideoTargetModelName;
  targetId: string;
  fieldPath: string;
}

declare global {
  namespace Express {
    interface Request {
      stagedVideoUploads?: Record<string, StagedVideoUpload>;
    }
  }
}

const VIDEO_PROCESSING_QUEUE_NAME = 'video-processing-queue-e-learning';

const VIDEO_TARGET_MODELS: Record<VideoTargetModelName, mongoose.Model<any>> = {
  JourneyCapsule,
  JourneyModule,
  JourneyLesson,
  IndividualLesson,
  IndividualCapsule,
};

let videoProcessingQueue: Queue<VideoProcessingJobData> | null = null;

function getVideoProcessingQueue(): Queue<VideoProcessingJobData> {
  if (!videoProcessingQueue) {
    videoProcessingQueue = new Queue<VideoProcessingJobData>(
      VIDEO_PROCESSING_QUEUE_NAME,
      { connection: redisConnectionOptions as any },
    );
  }

  return videoProcessingQueue;
}

function sanitizeFileName(fileName: string): string {
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return sanitized || `source${extname(fileName) || '.mp4'}`;
}

function inferVideoMimeType(fileName: string): string {
  const extension = extname(fileName).toLowerCase();

  switch (extension) {
    case '.webm':
      return 'video/webm';
    case '.ogg':
    case '.ogv':
      return 'video/ogg';
    case '.mov':
      return 'video/quicktime';
    case '.mkv':
      return 'video/x-matroska';
    case '.m4v':
      return 'video/x-m4v';
    case '.mp4':
    default:
      return 'video/mp4';
  }
}

function buildQueuedFile(
  originalname: string,
  mimetype: string,
  buffer: Buffer,
): Express.Multer.File {
  return {
    fieldname: 'video',
    originalname,
    encoding: '7bit',
    mimetype,
    size: buffer.length,
    buffer,
    destination: '',
    filename: originalname,
    path: '',
    stream: null as any,
  };
}

function buildFailureMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Video processing failed';
}

async function getNestedField(doc: Record<string, any> | null, fieldPath: string) {
  if (!doc) return undefined;
  return fieldPath.split('.').reduce((acc: any, key) => acc?.[key], doc);
}

async function updateVideoField(
  modelName: VideoTargetModelName,
  targetId: string,
  fieldPath: string,
  value: QueuedVideoInfo,
  options?: { onlyIfSourceKey?: string },
) {
  const model = VIDEO_TARGET_MODELS[modelName];

  // Don't overwrite a YouTube/Vimeo (or any newer) URL the admin saved after upload.
  if (options?.onlyIfSourceKey) {
    const current = await model.findById(targetId).lean();
    const currentField = getNestedField(current as any, fieldPath) as
      | { url?: string; status?: string }
      | undefined;
    const currentUrl = currentField?.url || '';
    const stillOwnedByThisUpload =
      !currentUrl ||
      currentUrl.includes(options.onlyIfSourceKey) ||
      currentField?.status === 'processing';

    if (!stillOwnedByThisUpload) {
      logger.info(
        `[VIDEO DEBUG] skip job overwrite on ${fieldPath} — current url is no longer this upload (${currentUrl.slice(0, 80)})`,
      );
      return;
    }
  }

  await model.findByIdAndUpdate(targetId, {
    $set: {
      [`${fieldPath}.url`]: value.url,
      [`${fieldPath}.duration`]: value.duration,
      [`${fieldPath}.status`]: value.status,
      [`${fieldPath}.errorMessage`]: value.errorMessage,
    },
  });
}

async function processQueuedVideo(job: Job<VideoProcessingJobData>) {
  const {
    sourceKey,
    originalname,
    mimetype,
    folderName,
    targetModel,
    targetId,
    fieldPath,
  } = job.data;

  try {
    const buffer = await downloadFileFromS3(sourceKey);
    const processedVideo = await processVideoToHls(
      buildQueuedFile(originalname, mimetype, buffer),
      folderName,
    );

    await updateVideoField(
      targetModel,
      targetId,
      fieldPath,
      {
        url: processedVideo.masterPlaylistUrl,
        duration: processedVideo.duration,
        status: 'ready',
      },
      { onlyIfSourceKey: sourceKey },
    );

    // HLS ready — remove temporary source upload
    try {
      await deleteFileByKey(sourceKey);
    } catch (deleteError) {
      logger.warn(`Failed to delete source file ${sourceKey}: ${deleteError}`);
    }
  } catch (error) {
    const message = buildFailureMessage(error);
    logger.warn(
      `HLS processing failed for ${sourceKey} — keeping original file URL. ${message}`,
    );

    await updateVideoField(
      targetModel,
      targetId,
      fieldPath,
      {
        url: getObjectUrlForKey(sourceKey),
        status: 'ready',
        errorMessage: `HLS unavailable, serving original file. ${message}`,
      },
      { onlyIfSourceKey: sourceKey },
    );
  }
}

export async function stageVideoForProcessing(
  file: Express.Multer.File,
  folderName: TFolderName,
): Promise<{ videoInfo: QueuedVideoInfo; stagedUpload: StagedVideoUpload }> {
  const token = randomUUID();
  const sanitizedFileName = sanitizeFileName(file.originalname);

  const sourceKey = await uploadFileToS3(
    file.buffer,
    sanitizedFileName,
    file.mimetype,
    `${folderName}/_source/${token}`,
    { preserveFileName: true },
  );

  // Expose the original file immediately so learners can play while HLS runs
  // (or when ffmpeg is unavailable on the host).
  return {
    videoInfo: {
      url: getObjectUrlForKey(sourceKey),
      status: 'ready',
    },
    stagedUpload: {
      token,
      folderName,
      sourceKey,
      originalname: file.originalname,
      mimetype: file.mimetype,
    },
  };
}

export function isVideoSourceReference(value: unknown): value is VideoSourceReference {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'sourceKey' in value &&
      typeof (value as { sourceKey?: unknown }).sourceKey === 'string',
  );
}

export async function stageUploadedVideoSource(
  source: VideoSourceReference,
  folderName: TFolderName,
): Promise<{ videoInfo: QueuedVideoInfo; stagedUpload: StagedVideoUpload }> {
  const originalname = source.originalname || basename(source.sourceKey) || `source.mp4`;
  const mimetype = source.mimetype || inferVideoMimeType(originalname);

  return {
    videoInfo: {
      status: 'processing',
    },
    stagedUpload: {
      token: randomUUID(),
      folderName,
      sourceKey: source.sourceKey,
      originalname,
      mimetype,
    },
  };
}

export function registerStagedVideoUpload(
  req: Express.Request,
  stagedUpload: StagedVideoUpload,
) {
  req.stagedVideoUploads = req.stagedVideoUploads || {};
  req.stagedVideoUploads[stagedUpload.token] = stagedUpload;
}

export async function enqueueVideoProcessingJob(
  stagedUpload: StagedVideoUpload,
  target: {
    targetModel: VideoTargetModelName;
    targetId: string;
    fieldPath: string;
  },
) {
  await getVideoProcessingQueue().add(
    'process-video',
    {
      ...stagedUpload,
      ...target,
    },
    {
      attempts: 3,
      removeOnComplete: 100,
      removeOnFail: 100,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  );
}

export function startVideoProcessingWorker() {
  const worker = new Worker<VideoProcessingJobData>(
    VIDEO_PROCESSING_QUEUE_NAME,
    processQueuedVideo,
    { connection: redisConnectionOptions as any },
  );

  worker.on('completed', job => {
    logger.info(`Video job ${job.id} (${job.name}) completed`);
  });

  worker.on('failed', (job, error) => {
    errorLogger.error(`Video job ${job?.id} (${job?.name}) failed`, error);
  });
}
