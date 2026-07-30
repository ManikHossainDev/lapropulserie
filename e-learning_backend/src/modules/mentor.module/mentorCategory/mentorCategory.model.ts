//@ts-ignore
import { model, Schema } from 'mongoose';
import { IMentorCategory, IMentorCategoryModel } from './mentorCategory.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const MentorCategorySchema = new Schema<IMentorCategory>(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
    },
    attachments: [
      //🔗🖼️
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'attachments is not required'],
      },
    ],
    mentorId: {
      //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'mentorId is required'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true },
);

MentorCategorySchema.plugin(paginate);
MentorCategorySchema.plugin(toJSON);

export const MentorCategory = model<
  IMentorCategory,
  IMentorCategoryModel
>('MentorCategory', MentorCategorySchema);
