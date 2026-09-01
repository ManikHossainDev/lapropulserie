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

export const uploadPipelineForCreateJourneyCapsule = [
  upload.any(),
  processUploadedFilesForCreateCapsule,
];

export const uploadPipelineForUpdateJourneyCapsule = [
  upload.any(),
  processUploadedFilesForUpdateCapsule,
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

async function processUploadedFilesForCreateCapsule(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const introVideoFromBody = req.body.introVideo;
    req.body = parseRequestBodyData(req);

    const files = mapUploadedFiles(req.files as Express.Multer.File[] | UploadedFiles | undefined);

    if (files?.thumbnail?.[0]) {
      req.body.thumbnail = await uploadFileAndGetUrl(
        files.thumbnail[0],
        TFolderName.journeyCapsule,
      );
    }

    if (files?.introVideo?.[0]) {
      req.body.introduction = req.body.introduction || {};
      const { videoInfo, stagedUpload } = await stageVideoForProcessing(
        files.introVideo[0],
        TFolderName.journeyCapsule,
      );
      registerStagedVideoUpload(req, stagedUpload);
      attachVideoUploadToken(req.body.introduction, 'introVideo', stagedUpload.token);
      req.body.introduction.introVideo = videoInfo;
    } else if (isVideoSourceReference(req.body?.introduction?.introVideo)) {
      req.body.introduction = req.body.introduction || {};
      const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
        req.body.introduction.introVideo,
        TFolderName.journeyCapsule,
      );
      registerStagedVideoUpload(req, stagedUpload);
      attachVideoUploadToken(req.body.introduction, 'introVideo', stagedUpload.token);
      req.body.introduction.introVideo = videoInfo;
    } else if (req.body.introduction?.introVideo && typeof req.body.introduction.introVideo === 'string') {
      req.body.introduction.introVideo = { url: req.body.introduction.introVideo };
    } else if (introVideoFromBody && typeof introVideoFromBody === 'string') {
      req.body.introduction = req.body.introduction || {};
      req.body.introduction.introVideo = { url: introVideoFromBody };
    }

    if (req.body.modules && Array.isArray(req.body.modules)) {
      for (let i = 0; i < req.body.modules.length; i++) {
        const moduleData = req.body.modules[i];
        const moduleFileKey = moduleData._fileKey as string | undefined;
        if (moduleFileKey && files?.[moduleFileKey]?.[0]) {
          const { videoInfo, stagedUpload } = await stageVideoForProcessing(
            files[moduleFileKey][0]!,
            TFolderName.journeyModule,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(moduleData, 'moduleVideo', stagedUpload.token);
          moduleData.moduleVideo = videoInfo;
          delete moduleData._fileKey;
        } else if (isVideoSourceReference(moduleData.moduleVideo)) {
          const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
            moduleData.moduleVideo,
            TFolderName.journeyModule,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(moduleData, 'moduleVideo', stagedUpload.token);
          moduleData.moduleVideo = videoInfo;
        }

        if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
          for (let j = 0; j < moduleData.lessons.length; j++) {
            const lesson = moduleData.lessons[j];
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
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

async function processUploadedFilesForUpdateCapsule(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const introVideoFromBody = req.body.introVideo;
    req.body = parseRequestBodyData(req);

    const files = mapUploadedFiles(req.files as Express.Multer.File[] | UploadedFiles | undefined);

    if (files?.thumbnail?.[0]) {
      req.body.thumbnail = await uploadFileAndGetUrl(
        files.thumbnail[0],
        TFolderName.journeyCapsule,
      );
    }

    if (files?.introVideo?.[0]) {
      req.body.introduction = req.body.introduction || {};
      const { videoInfo, stagedUpload } = await stageVideoForProcessing(
        files.introVideo[0],
        TFolderName.journeyCapsule,
      );
      registerStagedVideoUpload(req, stagedUpload);
      attachVideoUploadToken(req.body.introduction, 'introVideo', stagedUpload.token);
      req.body.introduction.introVideo = videoInfo;
    } else if (isVideoSourceReference(req.body?.introduction?.introVideo)) {
      req.body.introduction = req.body.introduction || {};
      const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
        req.body.introduction.introVideo,
        TFolderName.journeyCapsule,
      );
      registerStagedVideoUpload(req, stagedUpload);
      attachVideoUploadToken(req.body.introduction, 'introVideo', stagedUpload.token);
      req.body.introduction.introVideo = videoInfo;
    } else if (req.body.introduction?.introVideo && typeof req.body.introduction.introVideo === 'string') {
      req.body.introduction.introVideo = { url: req.body.introduction.introVideo };
    } else if (introVideoFromBody && typeof introVideoFromBody === 'string') {
      req.body.introduction = req.body.introduction || {};
      req.body.introduction.introVideo = { url: introVideoFromBody };
    }

    if (req.body.modules && Array.isArray(req.body.modules)) {
      for (let i = 0; i < req.body.modules.length; i++) {
        const moduleData = req.body.modules[i];
        const moduleFileKey = moduleData._fileKey as string | undefined;
        if (moduleFileKey && files?.[moduleFileKey]?.[0]) {
          const { videoInfo, stagedUpload } = await stageVideoForProcessing(
            files[moduleFileKey][0]!,
            TFolderName.journeyModule,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(moduleData, 'moduleVideo', stagedUpload.token);
          moduleData.moduleVideo = videoInfo;
          delete moduleData._fileKey;
        } else if (isVideoSourceReference(moduleData.moduleVideo)) {
          const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
            moduleData.moduleVideo,
            TFolderName.journeyModule,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(moduleData, 'moduleVideo', stagedUpload.token);
          moduleData.moduleVideo = videoInfo;
        }

        if (moduleData.lessons && Array.isArray(moduleData.lessons)) {
          for (let j = 0; j < moduleData.lessons.length; j++) {
            const lesson = moduleData.lessons[j];
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
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
