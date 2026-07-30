import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { TFolderName } from '../../../enums/folderNames';
import {
  isVideoSourceReference,
  registerStagedVideoUpload,
  stageUploadedVideoSource,
  stageVideoForProcessing,
  VideoUploadTokenMap,
} from '../../../services/video-processing-queue.service';

const storage = multer.memoryStorage();
const upload = multer({ storage });

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

export const uploadPipelineForCreateJourneyModule = [
  upload.any(),
  processUploadedFilesForCreateModule,
];

export const uploadPipelineForUpdateJourneyModule = [
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

    if (files?.moduleVideo?.[0]) {
      const { videoInfo, stagedUpload } = await stageVideoForProcessing(
        files.moduleVideo[0],
        TFolderName.journeyModule,
      );
      registerStagedVideoUpload(req, stagedUpload);
      attachVideoUploadToken(req.body as Record<string, any>, 'moduleVideo', stagedUpload.token);
      req.body.moduleVideo = videoInfo;
    } else if (isVideoSourceReference(req.body?.moduleVideo)) {
      const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
        req.body.moduleVideo,
        TFolderName.journeyModule,
      );
      registerStagedVideoUpload(req, stagedUpload);
      attachVideoUploadToken(req.body as Record<string, any>, 'moduleVideo', stagedUpload.token);
      req.body.moduleVideo = videoInfo;
    }

    if (req.body.lessons && Array.isArray(req.body.lessons)) {
      for (let i = 0; i < req.body.lessons.length; i++) {
        const lesson = req.body.lessons[i];
        const lessonFileKey = lesson._fileKey as string | undefined;
        if (lessonFileKey && files?.[lessonFileKey]?.[0]) {
          const { videoInfo, stagedUpload } = await stageVideoForProcessing(
            files[lessonFileKey][0]!,
            TFolderName.journeyLesson,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(lesson, 'lessonVideo', stagedUpload.token);
          lesson.lessonVideo = videoInfo;
          delete lesson._fileKey;
        } else if (isVideoSourceReference(lesson.lessonVideo)) {
          const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
            lesson.lessonVideo,
            TFolderName.journeyLesson,
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

    if (files?.moduleVideo?.[0]) {
      const { videoInfo, stagedUpload } = await stageVideoForProcessing(
        files.moduleVideo[0],
        TFolderName.journeyModule,
      );
      registerStagedVideoUpload(req, stagedUpload);
      attachVideoUploadToken(req.body as Record<string, any>, 'moduleVideo', stagedUpload.token);
      req.body.moduleVideo = videoInfo;
    } else if (isVideoSourceReference(req.body?.moduleVideo)) {
      const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
        req.body.moduleVideo,
        TFolderName.journeyModule,
      );
      registerStagedVideoUpload(req, stagedUpload);
      attachVideoUploadToken(req.body as Record<string, any>, 'moduleVideo', stagedUpload.token);
      req.body.moduleVideo = videoInfo;
    }

    if (req.body.lessons && Array.isArray(req.body.lessons)) {
      for (let i = 0; i < req.body.lessons.length; i++) {
        const lesson = req.body.lessons[i];
        const lessonFileKey = lesson._fileKey as string | undefined;
        if (lessonFileKey && files?.[lessonFileKey]?.[0]) {
          const { videoInfo, stagedUpload } = await stageVideoForProcessing(
            files[lessonFileKey][0]!,
            TFolderName.journeyLesson,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(lesson, 'lessonVideo', stagedUpload.token);
          lesson.lessonVideo = videoInfo;
          delete lesson._fileKey;
        } else if (isVideoSourceReference(lesson.lessonVideo)) {
          const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
            lesson.lessonVideo,
            TFolderName.journeyLesson,
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
