import { model, Schema } from 'mongoose';
import { IJourneyModule, IJourneyModuleModel } from './journey-module.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const JourneyModuleSchema = new Schema<IJourneyModule>(
  {
    sl: {
      type: Number,
      required: [true, 'sl is required'],
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
      required: [true, 'description is required'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'estimatedTime is required'],
    },
    moduleVideo: {
      url: {
        type: String,
        required: [false, 'moduleVideo url is not required'],
      },
      duration: {
        type: Number,
        required: [false, 'moduleVideo duration is not required'],
      },
      status: {
        type: String,
        enum: ['processing', 'ready', 'failed'],
        required: [false, 'moduleVideo status is not required'],
      },
      errorMessage: {
        type: String,
        required: [false, 'moduleVideo errorMessage is not required'],
      },
    },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'JourneyCapsule',
      required: [true, 'capsuleId is required'],
    },
    questionaryId: {
      type: Schema.Types.ObjectId,
      ref: 'Questionary',
      required: false,
    },
    orderNumber: {
      type: Number,
      required: [true, 'orderNumber is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

JourneyModuleSchema.plugin(paginate);
JourneyModuleSchema.plugin(toJSON);

export const JourneyModule = model<
  IJourneyModule,
  IJourneyModuleModel
>('JourneyModule', JourneyModuleSchema);
