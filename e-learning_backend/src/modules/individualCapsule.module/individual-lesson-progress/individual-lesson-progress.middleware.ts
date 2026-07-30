import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadPipelineForCreateIndividualLessonProgress = [
  upload.fields([{ name: 'attachments', maxCount: 1 }]),
];

export const uploadPipelineForUpdateIndividualLessonProgress = [
  upload.fields([{ name: 'attachments', maxCount: 1 }]),
];
