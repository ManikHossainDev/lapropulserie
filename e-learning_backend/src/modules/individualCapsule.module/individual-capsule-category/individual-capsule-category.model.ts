import { model, Schema } from 'mongoose';
import {
  IIndividualCapsuleCategory,
  IIndividualCapsuleCategoryModel,
} from './individual-capsule-category.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { TIndividualCapsuleLevel } from '../individual-capsule/individual-capsule.constant';

const IndividualCapsuleCategorySchema = new Schema<IIndividualCapsuleCategory>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    about: {
      type: String,
      required: [false, 'about is not required'],
      default: '',
    },
    thumbnail: {
      type: String,
      required: [false, 'thumbnail is not required'],
    },
    level: {
      type: String,
      enum: [
        TIndividualCapsuleLevel.beginner,
        TIndividualCapsuleLevel.intermediate,
        TIndividualCapsuleLevel.advanced,
      ],
      required: [false, 'level is not required'],
      default: TIndividualCapsuleLevel.beginner,
    },
    estimatedDuration: {
      type: Number,
      required: [false, 'estimatedDuration is not required'],
      min: [0, 'estimatedDuration cannot be negative'],
      default: 0,
    },
    price: {
      type: Number,
      required: [false, 'price is not required'],
      default: 0,
    },
    whatYouLearn: {
      type: [String],
      required: [false, 'whatYouLearn is not required'],
      default: [],
    },
    priceId: {
      type: String,
      required: [false, 'priceId is not required'],
    },
    sellIndividually: {
      type: Boolean,
      required: [false, 'sellIndividually is not required'],
      default: true,
    },
    capsuleType: {
      type: String,
      enum: ['free', 'regular'],
      default: 'regular',
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

IndividualCapsuleCategorySchema.plugin(paginate);
IndividualCapsuleCategorySchema.plugin(toJSON);

export const IndividualCapsuleCategory = model<
  IIndividualCapsuleCategory,
  IIndividualCapsuleCategoryModel
>('IndividualCapsuleCategory', IndividualCapsuleCategorySchema);
