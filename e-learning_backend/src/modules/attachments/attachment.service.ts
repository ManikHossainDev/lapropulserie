import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { StatusCodes } from 'http-status-codes';

import ApiError from '../../errors/ApiError';
import { Attachment } from './attachment.model';
import { AttachmentType } from './attachment.constant';
import { IAttachment } from './attachment.interface';
import { GenericService } from '../_generic-module/generic.services';
export class AttachmentService extends GenericService<
  typeof Attachment,
  IAttachment
> {
  constructor() {
    super(Attachment);
  }

  private async uploadFileToLocal(file: Express.Multer.File, folder: string) {
    const sanitizedFileName = file.originalname.replace(
      /[^a-zA-Z0-9.\-_]/g,
      '_',
    );
    const fileName = `${Date.now()}-${sanitizedFileName}`;
    const folderPath = join('uploads', folder);
    const filePath = join(folderPath, fileName);

    // Ensure directory exists
    mkdirSync(folderPath, { recursive: true });

    // Write file
    writeFileSync(filePath, file.buffer);

    const url = `/uploads/${folder}/${fileName}`;
    return { url, publicId: filePath };
  }

  /**
   * Upload a single attachment file
   * @param file - Multer file object
   * @param folderName - Target folder name
   * @returns Attachment ID
   */
  async uploadSingleAttachment(file: Express.Multer.File, folderName: string) {
    const { url: uploadedFileUrl, publicId } = await this.uploadFileToLocal(
      file,
      folderName,
    );

    const videoMimeTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-flv',
      'video/3gpp',
    ];

    let fileType:
      | AttachmentType.video
      | AttachmentType.image
      | AttachmentType.unknown
      | AttachmentType.document;
    if (file.mimetype.includes('image')) {
      fileType = AttachmentType.image;
    } else if (file.mimetype.includes('application')) {
      fileType = AttachmentType.document;
    } else if (
      file.mimetype.startsWith('video/') ||
      videoMimeTypes.includes(file.mimetype)
    ) {
      fileType = AttachmentType.video;
    } else {
      fileType = AttachmentType.unknown;
    }

    let _id: any;

    if (publicId) {
      // const { _id }
      _id = await this.create({
        attachment: uploadedFileUrl,
        attachmentType: fileType,
        mimeType: file.mimetype,
        publicId,
      });
    } else {
      // const { _id }
      _id = await this.create({
        attachment: uploadedFileUrl,
        attachmentType: fileType,
        mimeType: file.mimetype,
      });
    }

    return _id;
  }
}
