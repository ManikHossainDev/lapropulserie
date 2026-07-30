import { model, Schema } from 'mongoose';
import { IIndividualCapsuleReview, IIndividualCapsuleReviewModel } from './individual-capsule-review.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const IndividualCapsuleReviewSchema = new Schema<IIndividualCapsuleReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualCapsule',
      required: [true, 'capsuleId is required'],
    },
    review: {
      type: String,
      required: [true, 'review is required'],
    },
    rating: {
      type: Number,
      required: [true, 'rating is required'],
      min: [1, 'rating must be at least 1'],
      max: [5, 'rating must be at most 5'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

IndividualCapsuleReviewSchema.plugin(paginate);
IndividualCapsuleReviewSchema.plugin(toJSON);

export const IndividualCapsuleReview = model<
  IIndividualCapsuleReview,
  IIndividualCapsuleReviewModel
>('IndividualCapsuleReview', IndividualCapsuleReviewSchema);
