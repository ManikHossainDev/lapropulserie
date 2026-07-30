//@ts-ignore
import { model, Schema } from 'mongoose';
import { IMentorReview, IMentorReviewModel } from './mentorReview.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const MentorReviewSchema = new Schema<IMentorReview>(
  {
    userId: {
      //🔗 who provide the review
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    mentorId: {
      //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    review: {
      type: String,
      required: [true, 'review is required'],
    },
    rating: {
      type: Number,
      required: [true, 'rating is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

MentorReviewSchema.plugin(paginate);
MentorReviewSchema.plugin(toJSON);

export const MentorReview = model<
  IMentorReview,
  IMentorReviewModel
>('MentorReview', MentorReviewSchema) as any;
