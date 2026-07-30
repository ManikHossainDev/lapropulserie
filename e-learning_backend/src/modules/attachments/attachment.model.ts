import { model, Schema } from 'mongoose';
import paginate from '../../common/plugins/paginate';
import toJSON from '../../common/plugins/toJSON';
import { IAttachment, IAttachmentModel } from './attachment.interface';
import { AttachmentType } from './attachment.constant';

const attachmentSchema = new Schema<IAttachment>(
  {
    attachment: {
      type: String,
      required: [true, 'attachment is required'],
    },
    attachmentType: {
      type: String,
      enum: [
        AttachmentType.document,
        AttachmentType.image,
        AttachmentType.video,
        AttachmentType.unknown,
      ],
      required: [true, 'Attached Type is required. It can be pdf / image'],
    },
    mimeType: {
      type: String,
      required: [false, 'mimeType is not required'],
    },
    publicId: {
      type: String,
      required: [false, 'publicId is not required'],
    },
  },
  { timestamps: true },
);

attachmentSchema.plugin(paginate);

// Apply the toJSON plugin
attachmentSchema.plugin(toJSON);

export const Attachment = model<IAttachment, IAttachmentModel>(
  'Attachment',
  attachmentSchema
);