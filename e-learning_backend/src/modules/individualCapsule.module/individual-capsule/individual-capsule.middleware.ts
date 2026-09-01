import multer from 'multer';
import { processUploadedFilesForCreate, processUploadedFilesForUpdate } from '../../../middlewares/processUploadedFiles';
import { TFolderName } from '../../../enums/folderNames';

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB per video

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: MAX_VIDEO_BYTES },
});

export const uploadPipelineForCreateIndividualCapsule = [
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'founderVideo', maxCount: 1 },       // Part 1 – Introduction
    { name: 'inspirationVideo', maxCount: 1 },   // Part 2 – Inspiration
    { name: 'scienceVideo', maxCount: 1 },        // Part 5 – Science
  ]),
  processUploadedFilesForCreate([
    {
      name: 'thumbnail',
      folder: TFolderName.individualCapsule,
      required: false,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    },
    {
      name: 'founderVideo',
      folder: TFolderName.individualCapsule,
      required: false,
      // Broad list — browsers disagree on MOV/AVI MIME; empty type also allowed below via middleware
      allowedMimeTypes: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/x-m4v',
        'video/avi',
        'application/octet-stream',
      ],
    },
    {
      name: 'inspirationVideo',
      folder: TFolderName.individualCapsule,
      required: false,
      allowedMimeTypes: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/x-m4v',
        'video/avi',
        'application/octet-stream',
      ],
    },
    {
      name: 'scienceVideo',
      folder: TFolderName.individualCapsule,
      required: false,
      allowedMimeTypes: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/x-m4v',
        'video/avi',
        'application/octet-stream',
      ],
    },
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
    {
      name: 'founderVideo',
      folder: TFolderName.individualCapsule,
      required: false,
      allowedMimeTypes: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/x-m4v',
        'video/avi',
        'application/octet-stream',
      ],
    },
    {
      name: 'inspirationVideo',
      folder: TFolderName.individualCapsule,
      required: false,
      allowedMimeTypes: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/x-m4v',
        'video/avi',
        'application/octet-stream',
      ],
    },
    {
      name: 'scienceVideo',
      folder: TFolderName.individualCapsule,
      required: false,
      allowedMimeTypes: [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/webm',
        'video/x-m4v',
        'video/avi',
        'application/octet-stream',
      ],
    },
  ]),
];

