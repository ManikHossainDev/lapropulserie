import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import { logger } from '../shared/logger';

export const s3Client = new S3Client({
  region: config.aws.awsRegion || 'us-east-1',
  credentials: {
    accessKeyId: config.aws.awsApiKey || '',
    secretAccessKey: config.aws.awsSecretKey || '',
  },
});

export const BUCKET_NAME = config.aws.awsBucketName || 'la-propulserie-media';
const AWS_REGION = config.aws.awsRegion || 'us-east-1';
const AWS_PUBLIC_BASE_URL = config.aws.awsPublicBaseUrl?.replace(/\/+$/, '');

export function isAwsConfigured(): boolean {
  const { awsApiKey, awsSecretKey, awsBucketName } = config.aws;
  return Boolean(
    awsApiKey?.trim() &&
      awsSecretKey?.trim() &&
      awsBucketName?.trim(),
  );
}

interface UploadFileToS3Options {
  preserveFileName?: boolean;
}

export async function uploadFileToS3(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads',
  options: UploadFileToS3Options = {},
): Promise<string> {
  const key = options.preserveFileName
    ? `${folder}/${fileName}`
    : `${folder}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await s3Client.send(command);

  return key;
}

export function getObjectUrlForKey(key: string): string {
  const encodedKey = key
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');

  if (AWS_PUBLIC_BASE_URL) {
    return `${AWS_PUBLIC_BASE_URL}/${encodedKey}`;
  }

  return `https://${BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${encodedKey}`;
}

export async function deleteFileFromS3(fileUrl: string): Promise<void> {
  const parsedUrl = new URL(fileUrl);
  const key = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));

  await deleteFileByKey(key);
}

export async function deleteFileByKey(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export async function downloadFileFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);
  const byteArray = await response.Body?.transformToByteArray();

  if (!byteArray) {
    throw new Error(`Unable to download file from S3: ${key}`);
  }

  return Buffer.from(byteArray);
}

export async function getSignedUrlForKey(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

export async function getSignedUploadUrlForKey(
  key: string,
  contentType: string,
  expiresIn: number = 900,
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Deletes all HLS files under a folder prefix extracted from an HLS URL.
 * The HLS URL format is: {baseUrl}/{folderName}/{sessionId}/master.m3u8
 * This deletes everything under `{folderName}/{sessionId}/`.
 */
export async function deleteHlsFolderByUrl(hlsUrl: string): Promise<void> {
  try {
    const parsedUrl = new URL(hlsUrl);
    const pathname = decodeURIComponent(parsedUrl.pathname.replace(/^\/+/, ''));

    // Extract the folder prefix: everything up to and including the session UUID
    // e.g. "journey-capsule/abc-123-def" from "journey-capsule/abc-123-def/master.m3u8"
    const pathParts = pathname.split('/');
    if (pathParts.length < 2) {
      return; // Invalid path, nothing to delete
    }

    // The session folder is everything except the last segment (the filename)
    const sessionFolder = pathParts.slice(0, -1).join('/');

    if (!sessionFolder) {
      return; // Nothing to delete
    }

    // List all objects under the prefix
    let continuationToken: string | undefined;
    do {
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: sessionFolder + '/',
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(listCommand);
      continuationToken = response.NextContinuationToken;

      const objects = response.Contents || [];
      if (objects.length === 0) {
        continue;
      }

      // Delete each object
      for (const obj of objects) {
        if (!obj.Key) continue;
        const deleteCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: obj.Key,
        });
        await s3Client.send(deleteCommand);
      }

      logger.info(`Deleted ${objects.length} HLS objects under prefix: ${sessionFolder}/`);
    } while (continuationToken);
  } catch (error) {
    // Log but don't throw — old video cleanup shouldn't block new upload
    logger.warn(`Failed to delete old HLS folder for URL ${hlsUrl}: ${error}`);
  }
}
