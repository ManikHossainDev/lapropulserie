import { model, Schema } from 'mongoose';
import { IPurchasedJourney, IPurchasedJourneyModel } from './purchased-journey.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { PaymentMethod, TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';

const PurchasedJourneySchema = new Schema<IPurchasedJourney>(
  {
    journeyId: {
      type: Schema.Types.ObjectId,
      ref: 'Journey',
      required: [true, 'journeyId is required'],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    paymentTransactionId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentTransaction',
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: PaymentMethod,
      default: PaymentMethod.online,
    },
    paymentStatus: {
      type: String,
      enum: [
        TPaymentStatus.pending,
        TPaymentStatus.completed,
        TPaymentStatus.refunded,
        TPaymentStatus.failed,
      ],
      default: TPaymentStatus.pending,
      required: [false, 'paymentStatus is not required'],
    },
    isGifted: {
      type: Boolean,
      required: [false, 'isGifted is not required'],
      default: false,
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
    progressPercentage: {
      type: Number,
      required: [false, 'progressPercentage is not required'],
      min: [0, 'progressPercentage cannot be less than 0'],
      max: [100, 'progressPercentage cannot exceed 100'],
      default: 0,
    },
    completedCapsules: {
      type: Number,
      required: [false, 'completedCapsules is not required'],
      min: [0, 'completedCapsules cannot be negative'],
      default: 0,
    },
    totalCapsules: {
      type: Number,
      required: [false, 'totalCapsules is not required'],
      min: [0, 'totalCapsules cannot be negative'],
      default: 0,
    },
    completedModules: {
      type: Number,
      required: [false, 'completedModules is not required'],
      min: [0, 'completedModules cannot be negative'],
      default: 0,
    },
    totalModules: {
      type: Number,
      required: [false, 'totalModules is not required'],
      min: [0, 'totalModules cannot be negative'],
      default: 0,
    },
    completedLessons: {
      type: Number,
      required: [false, 'completedLessons is not required'],
      min: [0, 'completedLessons cannot be negative'],
      default: 0,
    },
    totalLessons: {
      type: Number,
      required: [false, 'totalLessons is not required'],
      min: [0, 'totalLessons cannot be negative'],
      default: 0,
    },
    overallStatus: {
      type: String,
      enum: ['notStarted', 'inProgress', 'completed'],
      required: [false, 'overallStatus is not required'],
      default: 'notStarted',
    },
    journeyType: {
      type: String,
      enum: ['free', 'regular'],
      required: [false, 'journeyType is not required'],
      default: 'regular',
    },
    completionDate: {
      type: Date,
      required: [false, 'completionDate is not required'],
    },
  },
  { timestamps: true },
);

PurchasedJourneySchema.plugin(paginate);
PurchasedJourneySchema.plugin(toJSON);

export const PurchasedJourney = model<
  IPurchasedJourney,
  IPurchasedJourneyModel
>('PurchasedJourney', PurchasedJourneySchema);
