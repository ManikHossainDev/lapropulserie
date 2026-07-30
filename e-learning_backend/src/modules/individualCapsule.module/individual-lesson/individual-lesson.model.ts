import { model, Schema } from 'mongoose';
import { IIndividualLesson, IIndividualLessonModel } from './individual-lesson.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const IndividualLessonSchema = new Schema<IIndividualLesson>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'estimatedTime is required'],
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
      ref: 'IndividualModule',
      required: [true, 'moduleId is required'],
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

IndividualLessonSchema.plugin(paginate);
IndividualLessonSchema.plugin(toJSON);

export const IndividualLesson = model<
  IIndividualLesson,
  IIndividualLessonModel
>('IndividualLesson', IndividualLessonSchema);
