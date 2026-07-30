import { Types } from 'mongoose';
import { TFolderName } from '../enums/folderNames';
import { AttachmentService } from '../modules/attachments/attachment.service';
import { uploadFileAndGetUrl } from './uploadHelpers';

/**
 * V1: Upload files and create Attachment documents, returning ObjectIds.
 * Use when you need to store references to the Attachment collection.
 */
export async function processFiles(
  files: any[],
  folderName: TFolderName,
): Promise<Types.ObjectId[]> {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(file =>
    new AttachmentService().uploadSingleAttachment(file, folderName),
  );

  return await Promise.all(uploadPromises);
}

/**
 * V2: Upload files and return URL strings only.
 * Use when you just need the file URL without Attachment collection references.
 */
export const processFilesV2 = async (
  files?: Express.Multer.File[],
  folderName?: TFolderName,
): Promise<string[]> => {
  if (!files || files.length === 0) return [];

  const uploadedUrls = await Promise.all(
    files.map(async file => {
      return await uploadFileAndGetUrl(file, folderName as TFolderName);
    }),
  );

  return uploadedUrls;
};
