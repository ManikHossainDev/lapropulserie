import multer from 'multer';
import { processUploadedFilesForCreate, processUploadedFilesForUpdate } from '../../../middlewares/processUploadedFiles';
import { TFolderName } from '../../../enums/folderNames';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadPipelineForCreateIndividualCapsuleCategory = [
  upload.fields([{ name: 'thumbnail', maxCount: 1 }]),
  processUploadedFilesForCreate([
    {
      name: 'thumbnail',
      folder: TFolderName.individualCapsuleCategory,
      required: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
  ]),
];

export const uploadPipelineForUpdateIndividualCapsuleCategory = [
  upload.fields([{ name: 'thumbnail', maxCount: 1 }]),
  processUploadedFilesForUpdate([
    {
      name: 'thumbnail',
      folder: TFolderName.individualCapsuleCategory,
      required: false,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
  ]),
];
