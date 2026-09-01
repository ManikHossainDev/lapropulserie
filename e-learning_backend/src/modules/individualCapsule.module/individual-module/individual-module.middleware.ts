import { Request, Response, NextFunction } from 'express';
import { TFolderName } from '../../../enums/folderNames';
import { createVideoUploadMulter } from '../../../helpers/videoUploadMulter';
import { uploadFileAndGetUrl } from '../../../helpers/uploadHelpers';
import {
  isVideoSourceReference,
  registerStagedVideoUpload,
  stageUploadedVideoSource,
  stageVideoForProcessing,
  VideoUploadTokenMap,
} from '../../../services/video-processing-queue.service';

const upload = createVideoUploadMulter();

interface UploadedFiles {
  [key: string]: Express.Multer.File[];
}

function attachVideoUploadToken(
  target: Record<string, any>,
  fieldName: string,
  token: string,
) {
  const existingTokens = (target.__videoUploadTokens || {}) as VideoUploadTokenMap;
  target.__videoUploadTokens = {
    ...existingTokens,
    [fieldName]: token,
  };
}

function parseRequestBodyData(req: Request) {
  if (typeof req.body?.data === 'string') {
    const parsedBody = JSON.parse(req.body.data);
    delete req.body.data;
    return parsedBody;
  }

  return req.body;
}

export const uploadPipelineForCreateIndividualModule = [
  upload.any(),
  processUploadedFilesForCreateModule,
];

export const uploadPipelineForUpdateIndividualModule = [
  upload.any(),
  processUploadedFilesForUpdateModule,
];

function mapUploadedFiles(
  files: Express.Multer.File[] | UploadedFiles | undefined,
): UploadedFiles {
  if (!files) {
    return {};
  }

  if (Array.isArray(files)) {
    return files.reduce<UploadedFiles>((acc, file) => {
      if (!acc[file.fieldname]) {
        acc[file.fieldname] = [];
      }

      acc[file.fieldname]!.push(file);
      return acc;
    }, {});
  }

  return files;
}

async function processUploadedFilesForCreateModule(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = parseRequestBodyData(req);

    const files = mapUploadedFiles(req.files as Express.Multer.File[] | UploadedFiles | undefined);

    if (files?.thumbnail?.[0]) {
      req.body.thumbnail = await uploadFileAndGetUrl(
        files.thumbnail[0],
        TFolderName.individualModule,
      );
    }

    if (req.body.lessons && Array.isArray(req.body.lessons)) {
      for (let i = 0; i < req.body.lessons.length; i++) {
        const lesson = req.body.lessons[i];
        const lessonFileKey = lesson._fileKey as string | undefined;
        if (lessonFileKey && files?.[lessonFileKey]?.[0]) {
          const { videoInfo, stagedUpload } = await stageVideoForProcessing(
            files[lessonFileKey][0]!,
            TFolderName.individualLesson,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(lesson, 'lessonVideo', stagedUpload.token);
          lesson.lessonVideo = videoInfo;
          delete lesson._fileKey;
        } else if (isVideoSourceReference(lesson.lessonVideo)) {
          const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
            lesson.lessonVideo,
            TFolderName.individualLesson,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(lesson, 'lessonVideo', stagedUpload.token);
          lesson.lessonVideo = videoInfo;
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

async function processUploadedFilesForUpdateModule(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    req.body = parseRequestBodyData(req);

    const files = mapUploadedFiles(req.files as Express.Multer.File[] | UploadedFiles | undefined);

    if (files?.thumbnail?.[0]) {
      req.body.thumbnail = await uploadFileAndGetUrl(
        files.thumbnail[0],
        TFolderName.individualModule,
      );
    }

    if (req.body.lessons && Array.isArray(req.body.lessons)) {
      for (let i = 0; i < req.body.lessons.length; i++) {
        const lesson = req.body.lessons[i];
        const lessonFileKey = lesson._fileKey as string | undefined;
        if (lessonFileKey && files?.[lessonFileKey]?.[0]) {
          const { videoInfo, stagedUpload } = await stageVideoForProcessing(
            files[lessonFileKey][0]!,
            TFolderName.individualLesson,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(lesson, 'lessonVideo', stagedUpload.token);
          lesson.lessonVideo = videoInfo;
          delete lesson._fileKey;
        } else if (isVideoSourceReference(lesson.lessonVideo)) {
          const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
            lesson.lessonVideo,
            TFolderName.individualLesson,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(lesson, 'lessonVideo', stagedUpload.token);
          lesson.lessonVideo = videoInfo;
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
