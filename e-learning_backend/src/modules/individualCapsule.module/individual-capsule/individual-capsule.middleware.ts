import {
  CAPSULE_VIDEO_MIME_TYPES,
  createVideoUploadMulter,
} from '../../../helpers/videoUploadMulter';
import { processUploadedFilesForCreate, processUploadedFilesForUpdate } from '../../../middlewares/processUploadedFiles';
import { TFolderName } from '../../../enums/folderNames';

const upload = createVideoUploadMulter();

const videoField = (name: string) => ({
  name,
  folder: TFolderName.individualCapsule,
  required: false,
  allowedMimeTypes: CAPSULE_VIDEO_MIME_TYPES,
});

export const uploadPipelineForCreateIndividualCapsule = [
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'founderVideo', maxCount: 1 }, // Part 1 – Introduction
    { name: 'inspirationVideo', maxCount: 1 }, // Part 2 – Inspiration
    { name: 'scienceVideo', maxCount: 1 }, // Part 5 – Science
  ]),
  processUploadedFilesForCreate([
    {
      name: 'thumbnail',
      folder: TFolderName.individualCapsule,
      required: false,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
    videoField('founderVideo'),
    videoField('inspirationVideo'),
    videoField('scienceVideo'),
  ]),
];

export const uploadPipelineForUpdateIndividualCapsule = [
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'founderVideo', maxCount: 1 },
    { name: 'inspirationVideo', maxCount: 1 },
    { name: 'scienceVideo', maxCount: 1 },
  ]),
  processUploadedFilesForUpdate([
    {
      name: 'thumbnail',
      folder: TFolderName.individualCapsule,
      required: false,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
    videoField('founderVideo'),
    videoField('inspirationVideo'),
    videoField('scienceVideo'),
  ]),
];
