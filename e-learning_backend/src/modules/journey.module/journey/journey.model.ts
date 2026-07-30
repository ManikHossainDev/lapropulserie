import { model, Schema } from 'mongoose';
import { IJourney, IJourneyModel } from './journey.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const JourneySchema = new Schema<IJourney>(
  {
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'adminId is required'],
    },
    numberOfCapsule: {
      type: Number,
      required: [false, 'numberOfCapsule is not required'],
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    roadMapBrief: {
      type: String,
      required: [true, 'roadMapBrief is required'],
    },
    description: {
      type: String,
      required: [false, 'description is not required'],
    },
    thumbnail: {
      type: String,
      required: [false, 'thumbnail is not required'],
    },
    isActive: {
      type: Boolean,
      required: [false, 'isActive is not required'],
      default: true,
    },
    averageRating: {
      type: Number,
      required: [false, 'averageRating is not required'],
      min: [0, 'averageRating cannot be less than 0'],
      max: [5, 'averageRating cannot exceed 5'],
      default: 0,
    },
    totalReviewCount: {
      type: Number,
      required: [false, 'totalReviewCount is not required'],
      min: [0, 'totalReviewCount cannot be negative'],
      default: 0,
    },
    totalCapsules: {
      type: Number,
      required: [false, 'totalCapsules is not required'],
      min: [0, 'totalCapsules cannot be negative'],
    },
    priceId: {
      type: String,
      required: [false, 'priceId is not required'],
    },
    journeyType: {
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
  { timestamps: true },
);

JourneySchema.plugin(paginate);
JourneySchema.plugin(toJSON);

export const Journey = model<IJourney, IJourneyModel>('Journey', JourneySchema);
