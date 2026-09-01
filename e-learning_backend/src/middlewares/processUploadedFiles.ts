//@ts-ignore
import { Request, Response, NextFunction } from 'express';
import { processFilesV2 } from '../helpers/processFilesToUpload';
import { uploadFileAndGetUrl } from '../helpers/uploadHelpers';
import { FileFieldConfig } from '../modules/attachments/attachment.interface';
import {
  isVideoSourceReference,
  registerStagedVideoUpload,
  stageUploadedVideoSource,
  stageVideoForProcessing,
  VideoUploadTokenMap,
} from '../services/video-processing-queue.service';

type UploadedFiles = Record<string, string[]>;

declare global {
  namespace Express {
    interface Request {
      uploadedFiles?: UploadedFiles;
    }
  }
}

const isVideoField = (name: string) =>
  name === 'video' ||
  name === 'introVideo' ||
  name === 'lessonVideo' ||
  name === 'moduleVideo' ||
  name === 'founderVideo' ||        // Part 1 – Introduction
  name === 'inspirationVideo' ||    // Part 2 – Inspiration
  name === 'scienceVideo';          // Part 5 – Science

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

export const processUploadedFilesForCreate = (configs: FileFieldConfig[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = parseRequestBodyData(req);

      const uploadedFiles: UploadedFiles = {};

      for (const config of configs) {
        const files = (req.files as any)?.[config.name] as
          | Express.Multer.File[]
          | undefined;

        if (config.required && (!files || files.length === 0)) {
          throw new Error(`Missing required file field: ${config.name}`);
        }

        if (config.allowedMimeTypes && files?.length) {
          const invalid = files.some((f) => {
            // Some browsers send empty MIME for .mov/.avi — allow for video fields
            if (
              isVideoField(config.name) &&
              (!f.mimetype || f.mimetype === 'application/octet-stream')
            ) {
              return false;
            }
            return !config.allowedMimeTypes!.includes(f.mimetype);
          });
          if (invalid) {
            throw new Error(`Invalid file type for field: ${config.name}`);
          }
        }

        if (config.name === 'thumbnail') {
          if (files && files.length > 0) {
            req.body.thumbnail = await uploadFileAndGetUrl(files[0]!, config.folder);
          } else {
            req.body.thumbnail = null;
          }
        } else if (isVideoField(config.name)) {
          if (files && files.length > 0) {
            const { videoInfo, stagedUpload } = await stageVideoForProcessing(
              files[0]!,
              config.folder,
            );
            registerStagedVideoUpload(req, stagedUpload);
            attachVideoUploadToken(req.body as Record<string, any>, config.name, stagedUpload.token);
            req.body[config.name] = videoInfo;
          } else if (isVideoSourceReference(req.body?.[config.name])) {
            const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
              req.body[config.name],
              config.folder,
            );
            registerStagedVideoUpload(req, stagedUpload);
            attachVideoUploadToken(req.body as Record<string, any>, config.name, stagedUpload.token);
            req.body[config.name] = videoInfo;
          } else {
            req.body[config.name] = null;
          }
        } else {
          const uploaded = await processFilesV2(files, config.folder);
          req.body[config.name] = uploaded;
        }
      }

      req.uploadedFiles = uploadedFiles;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const processUploadedFilesForUpdate = (configs: FileFieldConfig[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = parseRequestBodyData(req);

      const uploadedFiles: UploadedFiles = {};

      for (const config of configs) {
        const files = (req.files as any)?.[config.name] as
          | Express.Multer.File[]
          | undefined;

        if (config.required && (!files || files.length === 0)) {
          throw new Error(`Missing required file field: ${config.name}`);
        }

        if (config.allowedMimeTypes && files?.length) {
          const invalid = files.some((f) => {
            // Some browsers send empty MIME for .mov/.avi — allow for video fields
            if (
              isVideoField(config.name) &&
              (!f.mimetype || f.mimetype === 'application/octet-stream')
            ) {
              return false;
            }
            return !config.allowedMimeTypes!.includes(f.mimetype);
          });
          if (invalid) {
            throw new Error(`Invalid file type for field: ${config.name}`);
          }
        }

        if (files && files.length > 0) {
          if (config.name === 'thumbnail') {
            req.body.thumbnail = await uploadFileAndGetUrl(files[0]!, config.folder);
          } else if (isVideoField(config.name)) {
            const { videoInfo, stagedUpload } = await stageVideoForProcessing(
              files[0]!,
              config.folder,
            );
            registerStagedVideoUpload(req, stagedUpload);
            attachVideoUploadToken(req.body as Record<string, any>, config.name, stagedUpload.token);
            req.body[config.name] = videoInfo;
          } else {
            const uploaded = await processFilesV2(files, config.folder);
            req.body[config.name] = uploaded;
          }
        } else if (isVideoField(config.name) && isVideoSourceReference(req.body?.[config.name])) {
          const { videoInfo, stagedUpload } = await stageUploadedVideoSource(
            req.body[config.name],
            config.folder,
          );
          registerStagedVideoUpload(req, stagedUpload);
          attachVideoUploadToken(req.body as Record<string, any>, config.name, stagedUpload.token);
          req.body[config.name] = videoInfo;
        }
      }

      req.uploadedFiles = uploadedFiles;
      next();
    } catch (error) {
      next(error);
    }
  };
};
