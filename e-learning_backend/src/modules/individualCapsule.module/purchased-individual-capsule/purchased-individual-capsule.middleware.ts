import multer from "multer";
import { processUploadedFilesForCreate, processUploadedFilesForUpdate } from "../../../middlewares/processUploadedFiles";
import { TFolderName } from "../../../enums/folderNames";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const imageUploadPipelineForCreatePurchasedIndividualCapsule = [
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 },
    ]),
  ],
  processUploadedFilesForCreate([
    {
      name: 'attachments',
      folder: TFolderName.individualCapsule,
      required: true,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    },
  ]),
];


export const imageUploadPipelineForUpdatePurchasedIndividualCapsule = [
  [
    upload.fields([
      { name: 'attachments', maxCount: 1 },
    ]),
  ],
  processUploadedFilesForUpdate([
    {
      name: 'attachments',
      folder: TFolderName.individualCapsule,
      required: true,
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    },
  ]),
];
