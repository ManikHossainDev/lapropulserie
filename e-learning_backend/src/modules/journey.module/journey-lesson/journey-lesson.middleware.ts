import {
  CAPSULE_VIDEO_MIME_TYPES,
  createVideoUploadMulter,
} from '../../../helpers/videoUploadMulter';
import { processUploadedFilesForCreate, processUploadedFilesForUpdate } from '../../../middlewares/processUploadedFiles';
import { TFolderName } from '../../../enums/folderNames';

const upload = createVideoUploadMulter();

export const uploadPipelineForCreateJourneyLesson = [
  upload.fields([{ name: 'lessonVideo', maxCount: 1 }]),
  processUploadedFilesForCreate([
    {
      name: 'lessonVideo',
      folder: TFolderName.journeyLesson,
      required: false,
      allowedMimeTypes: CAPSULE_VIDEO_MIME_TYPES,
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
      allowedMimeTypes: CAPSULE_VIDEO_MIME_TYPES,
    },
  ]),
];
