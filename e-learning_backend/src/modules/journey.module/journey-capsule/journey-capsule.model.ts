import { model, Schema } from 'mongoose';
import { IJourneyCapsule, IJourneyCapsuleModel, IJourneyCapsuleIntroduction } from './journey-capsule.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const JourneyCapsuleIntroductionSchema =
  new Schema<IJourneyCapsuleIntroduction>({
    title: {
      type: String,
      required: [true, 'introduction title is required'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'introduction estimatedTime is required'],
    },
    roadMapBrief: {
      type: String,
      required: [true, 'introduction roadMapBrief is required'],
    },
    description: {
      type: String,
      required: [true, 'introduction description is required'],
    },
    introVideo: {
      url: {
        type: String,
        required: [false, 'introVideo url is not required'],
      },
      duration: {
        type: Number,
        required: [false, 'introVideo duration is not required'],
      },
      status: {
        type: String,
        enum: ['processing', 'ready', 'failed'],
        required: [false, 'introVideo status is not required'],
      },
      errorMessage: {
        type: String,
        required: [false, 'introVideo errorMessage is not required'],
      },
    },
  });
JourneyCapsuleIntroductionSchema.plugin(toJSON);

const JourneyCapsuleSchema = new Schema<IJourneyCapsule>(
  {
    capsuleNumber: {
      type: Number,
      required: [true, 'capsuleNumber is required'],
      min: [1, 'capsuleNumber must be at least 1'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
      trim: true,
    },
    roadMapBrief: {
      type: String,
      required: [true, 'roadMapBrief is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'description is required'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'estimatedTime is required'],
    },
    thumbnail: {
      type: String,
      required: [false, 'thumbnail is not required'],
    },
    journeyId: {
      type: Schema.Types.ObjectId,
      ref: 'Journey',
      required: [true, 'journeyId is required'],
    },
    individualCapsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualCapsule',
      required: [false, 'individualCapsuleId is not required'],
    },
    totalModule: {
      type: Number,
      required: [true, 'totalModule is required'],
      min: [0, 'totalModule cannot be negative'],
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'adminId is required'],
    },
    introduction: JourneyCapsuleIntroductionSchema,
    questionaryId: {
      type: Schema.Types.ObjectId,
      ref: 'Questionary',
      required: [false, 'questionaryId is not required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

JourneyCapsuleSchema.plugin(paginate);
JourneyCapsuleSchema.plugin(toJSON);

export const JourneyCapsule = model<
  IJourneyCapsule,
  IJourneyCapsuleModel
>('JourneyCapsule', JourneyCapsuleSchema);
