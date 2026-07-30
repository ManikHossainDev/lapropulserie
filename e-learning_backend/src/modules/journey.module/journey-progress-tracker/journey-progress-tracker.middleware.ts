import multer from 'multer';
import { processUploadedFilesForCreate, processUploadedFilesForUpdate } from '../../../middlewares/processUploadedFiles';
import { TFolderName } from '../../../enums/folderNames';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadPipelineForCreateJourneyProgressTracker = [
  upload.fields([{ name: 'attachments', maxCount: 1 }]),
  processUploadedFilesForCreate([
    {
      name: 'attachments',
      folder: TFolderName.common,
      required: false,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    },
  ]),
];

export const uploadPipelineForUpdateJourneyProgressTracker = [
  upload.fields([{ name: 'attachments', maxCount: 1 }]),
  processUploadedFilesForUpdate([
    {
      name: 'attachments',
      folder: TFolderName.common,
      required: false,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    },
  ]),
];
