import multer from 'multer';
import { processUploadedFilesForCreate, processUploadedFilesForUpdate } from '../../../middlewares/processUploadedFiles';
import { TFolderName } from '../../../enums/folderNames';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadPipelineForCreateJourneyLesson = [
  upload.fields([{ name: 'lessonVideo', maxCount: 1 }]),
  processUploadedFilesForCreate([
    {
      name: 'lessonVideo',
      folder: TFolderName.journeyLesson,
      required: false,
      allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    },
  ]),
];

export const uploadPipelineForUpdateJourneyLesson = [
  upload.fields([{ name: 'lessonVideo', maxCount: 1 }]),
  processUploadedFilesForUpdate([
    {
      name: 'lessonVideo',
      folder: TFolderName.journeyLesson,
      required: false,
      allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    },
  ]),
];
