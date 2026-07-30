import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { TFolderName } from '../../../enums/folderNames';
import { uploadFileAndGetUrl } from '../../../helpers/uploadHelpers';

const upload = multer({ storage: multer.memoryStorage() });

/** Journey cover image — must stay distinct from the capsule thumbnails (client #35). */
async function processJourneyThumbnail(req: Request, _res: Response, next: NextFunction) {
  try {
    if (typeof req.body?.data === 'string') {
      const parsed = JSON.parse(req.body.data);
      delete req.body.data;
      req.body = { ...req.body, ...parsed };
    }

    const files = (req.files as Express.Multer.File[] | undefined) || [];
    const thumbnail = files.find((file) => file.fieldname === 'thumbnail');

    if (thumbnail) {
      req.body.thumbnail = await uploadFileAndGetUrl(thumbnail, TFolderName.journey);
    }

    next();
  } catch (error) {
    next(error);
  }
}

export const uploadPipelineForJourney = [upload.any(), processJourneyThumbnail];
