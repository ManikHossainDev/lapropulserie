import express, { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import auth from '../../middlewares/auth';
import { TRole } from '../../middlewares/roles';
import { TFolderName } from '../../enums/folderNames';
import sendResponse from '../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { getSignedUploadUrlForKey } from '../../services/aws-s3.service';

const router = express.Router();

const ALLOWED_VIDEO_FOLDERS = new Set<string>([
  TFolderName.journeyCapsule,
  TFolderName.journeyModule,
  TFolderName.journeyLesson,
  TFolderName.individualLesson,
]);

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_') || 'source.mp4';
}

router.post(
  '/presigned-url',
  auth(TRole.admin),
  async (req: Request, res: Response) => {
    const { folderName, fileName, contentType } = req.body as {
      folderName?: string;
      fileName?: string;
      contentType?: string;
    };

    if (!folderName || !ALLOWED_VIDEO_FOLDERS.has(folderName)) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'folderName must be one of the supported video folders',
      });
    }

    if (!fileName || typeof fileName !== 'string') {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'fileName is required',
      });
    }

    if (!contentType || typeof contentType !== 'string' || !contentType.startsWith('video/')) {
      return sendResponse(res, {
        code: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'contentType must be a valid video mime type',
      });
    }

    const sourceKey = `${folderName}/_source/${randomUUID()}/${sanitizeFileName(fileName)}`;
    const uploadUrl = await getSignedUploadUrlForKey(sourceKey, contentType);

    sendResponse(res, {
      code: StatusCodes.OK,
      success: true,
      message: 'Presigned upload URL generated successfully',
      data: {
        method: 'PUT',
        uploadUrl,
        sourceKey,
        fileName: sanitizeFileName(fileName),
        contentType,
        expiresIn: 900,
      },
    });
  },
);

export const VideoUploadRoute = router;
