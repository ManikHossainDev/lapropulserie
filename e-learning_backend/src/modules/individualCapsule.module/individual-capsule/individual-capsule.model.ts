import { model, Schema } from 'mongoose';
import { IIndividualCapsule, IIndividualCapsuleModel } from './individual-capsule.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { TIndividualCapsuleLevel } from './individual-capsule.constant';

// ── Part sub-schemas ──────────────────────────────────────────────────────────

const VideoInfoSchema = new Schema({
  url: { type: String },
  duration: { type: Number },
  status: {
    type: String,
    enum: ['processing', 'ready', 'failed'],
    default: 'ready',
  },
  errorMessage: { type: String },
}, { _id: false });

const IntroductionSchema = new Schema({
  title: { type: String },
  founderVideo: { type: VideoInfoSchema },
  text: { type: String },
}, { _id: false });

const InspirationSchema = new Schema({
  title: { type: String },
  inspirationVideo: { type: VideoInfoSchema },
  text: { type: String },
}, { _id: false });

const ReflectionQuestionSchema = new Schema({
  question: { type: String, required: true },
  orderNumber: { type: Number, required: true },
}, { _id: false });

const ReflectionSchema = new Schema({
  title: { type: String },
  instructions: { type: String },
  questions: {
    type: [ReflectionQuestionSchema],
    default: [],
    validate: {
      validator: (v: any[]) => v.length <= 10,
      message: 'reflection questions cannot exceed 10',
    },
  },
}, { _id: false });

const PracticalExerciseSchema = new Schema({
  exercise: { type: String, required: true },
  orderNumber: { type: Number, required: true },
}, { _id: false });

const PracticalSchema = new Schema({
  title: { type: String },
  exercises: { type: [PracticalExerciseSchema], default: [] },
}, { _id: false });

const ScienceSchema = new Schema({
  title: { type: String },
  text: { type: String },
  optionalVideo: { type: VideoInfoSchema },
}, { _id: false });

// ── Main schema ───────────────────────────────────────────────────────────────

const IndividualCapsuleSchema = new Schema<IIndividualCapsule>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    level: {
      type: String,
      enum: [
        TIndividualCapsuleLevel.beginner,
        TIndividualCapsuleLevel.intermediate,
        TIndividualCapsuleLevel.advanced,
      ],
      required: [false, 'level is not required'],
    },
    description: {
      type: String,
      required: [false, 'description is not required'],
      default: '',
    },
    about: {
      type: String,
      required: [false, 'about is not required'],
      default: '',
    },
    numberOfModules: {
      type: Number,
      required: [false, 'numberOfModules is not required'],
      min: [0, 'numberOfModules cannot be negative'],
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
    thumbnail: {
      type: String,
      required: [false, 'thumbnail is not required'],
    },
    capsuleCategoryId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualCapsuleCategory',
      required: [true, 'capsuleCategoryId is required'],
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'adminId is required'],
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
    priceId: {
      type: String,
      required: [false, 'priceId is not required'],
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

    // ── 6-Part journey content (all optional) ─────────────────────────────
    introduction: { type: IntroductionSchema, required: false },       // Part 1
    inspiration: { type: InspirationSchema, required: false },         // Part 2
    reflection: { type: ReflectionSchema, required: false },           // Part 3
    practicalExercises: { type: PracticalSchema, required: false },    // Part 4
    science: { type: ScienceSchema, required: false },                 // Part 5
    // Part 6 (Marii AI report) stored in separate MariiReport collection
  },
  { timestamps: true, versionKey: false },
);

IndividualCapsuleSchema.plugin(paginate);
IndividualCapsuleSchema.plugin(toJSON);

export const IndividualCapsule = model<
  IIndividualCapsule,
  IIndividualCapsuleModel
>('IndividualCapsule', IndividualCapsuleSchema);



