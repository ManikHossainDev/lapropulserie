import { TFolderName } from '../enums/folderNames';
import {
  getObjectUrlForKey,
  isAwsConfigured,
  uploadFileToS3,
} from '../services/aws-s3.service';

export async function uploadFileAndGetUrl(
  file: Express.Multer.File,
  folderName: TFolderName,
): Promise<string> {
  if (!isAwsConfigured()) {
    throw new Error(
      'AWS is not configured. Set AWS_ACCESS_KEY_ID (or AWS_API_KEY), AWS_SECRET_ACCESS_KEY (or AWS_SECRET_KEY), and AWS_BUCKET_NAME in .env',
    );
  }

  const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const fileName = `${Date.now()}-${sanitizedFileName}`;

  const key = await uploadFileToS3(
    file.buffer,
    fileName,
    file.mimetype,
    folderName,
  );

  return getObjectUrlForKey(key);
}
