import {
  CAPSULE_VIDEO_MIME_TYPES,
  createVideoUploadMulter,
} from '../../../helpers/videoUploadMulter';
import { processUploadedFilesForCreate, processUploadedFilesForUpdate } from '../../../middlewares/processUploadedFiles';
import { TFolderName } from '../../../enums/folderNames';

const upload = createVideoUploadMulter();

export const uploadPipelineForCreateIndividualLesson = [
  upload.fields([{ name: 'lessonVideo', maxCount: 1 }]),
  processUploadedFilesForCreate([
    {
      name: 'lessonVideo',
      folder: TFolderName.individualLesson,
      required: false,
      allowedMimeTypes: CAPSULE_VIDEO_MIME_TYPES,
    },
  ]),
];

export const uploadPipelineForUpdateIndividualLesson = [
  upload.fields([{ name: 'lessonVideo', maxCount: 1 }]),
  processUploadedFilesForUpdate([
    {
      name: 'lessonVideo',
      folder: TFolderName.individualLesson,
      required: false,
      allowedMimeTypes: CAPSULE_VIDEO_MIME_TYPES,
    },
  ]),
];
