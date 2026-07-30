import { model, Schema } from 'mongoose';
import { IStudentCapsuleTracker, IStudentCapsuleTrackerModel } from './student-capsule-tracker.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { TCurrentSection, TTrackerStatus } from './student-capsule-tracker.constant';

const StudentCapsuleTrackerSchema = new Schema<IStudentCapsuleTracker>(
  {
    capsuleNumber: {
      type: Number,
      required: [false, 'capsuleNumber is not required'],
    },
    title: {
      type: String,
      required: [false, 'title is not required'],
    },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'JourneyCapsule',
      required: [true, 'capsuleId is required'],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    currentSection: {
      type: String,
      enum: [
        TCurrentSection.introduction,
        TCurrentSection.inspiration,
        TCurrentSection.diagnostics,
        TCurrentSection.science,
        TCurrentSection.aiSummary,
      ],
      required: [true, 'currentSection is required'],
    },
    introStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, 'introStatus is required'],
    },
    inspirationStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, 'inspirationStatus is required'],
    },
    diagnosticsStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, 'diagnosticsStatus is required'],
    },
    scienceStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, 'scienceStatus is required'],
    },
    aiSummaryStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, 'aiSummaryStatus is required'],
    },
    overallStatus: {
      type: String,
      enum: Object.values(TTrackerStatus),
      required: [true, 'overallStatus is required'],
    },
    progressPercentage: {
      type: Number,
      required: [false, 'progressPercentage is not required'],
    },
    aiSummaryContent: {
      type: String,
      required: [false, 'aiSummaryContent is not required'],
    },
    aiSummaryGeneratedAt: {
      type: Date,
      required: [false, 'aiSummaryGeneratedAt is not required'],
    },
    studentsAnswer: {
      type: String,
      required: [false, 'studentsAnswer is not required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true },
);

StudentCapsuleTrackerSchema.plugin(paginate);
StudentCapsuleTrackerSchema.plugin(toJSON);

export const StudentCapsuleTracker = model<
  IStudentCapsuleTracker,
  IStudentCapsuleTrackerModel
>('StudentCapsuleTracker', StudentCapsuleTrackerSchema);
