import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadPipelineForCreateIndividualModuleProgress = [
  upload.fields([{ name: 'attachments', maxCount: 1 }]),
];

export const uploadPipelineForUpdateIndividualModuleProgress = [
  upload.fields([{ name: 'attachments', maxCount: 1 }]),
];
