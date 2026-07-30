import { model, Schema } from 'mongoose';
import { IJourneyLesson, IJourneyLessonModel } from './journey-lesson.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const JourneyLessonSchema = new Schema<IJourneyLesson>(
  {
    sl: {
      type: Number,
      required: [true, 'sl is required'],
    },
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    description: {
      type: String,
      required: [false, 'description is not required'],
    },
    lessonVideo: {
      url: {
        type: String,
        required: [false, 'lessonVideo url is not required'],
      },
      duration: {
        type: Number,
        required: [false, 'lessonVideo duration is not required'],
      },
      status: {
        type: String,
        enum: ['processing', 'ready', 'failed'],
        required: [false, 'lessonVideo status is not required'],
      },
      errorMessage: {
        type: String,
        required: [false, 'lessonVideo errorMessage is not required'],
      },
    },
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'JourneyModule',
      required: [true, 'moduleId is required'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'estimatedTime is required'],
    },
    durationInSeconds: {
      type: Number,
      required: [false, 'durationInSeconds is not required'],
    },
    orderNumber: {
      type: Number,
      required: [false, 'orderNumber is not required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

JourneyLessonSchema.plugin(paginate);
JourneyLessonSchema.plugin(toJSON);

export const JourneyLesson = model<IJourneyLesson, IJourneyLessonModel>(
  'JourneyLesson',
  JourneyLessonSchema
);
