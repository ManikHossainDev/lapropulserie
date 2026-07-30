import { model, Schema } from 'mongoose';
import { IPurchasedIndividualCapsule, IPurchasedIndividualCapsuleModel } from './purchased-individual-capsule.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { TPurchasedIndividualCapsuleStatus } from './purchased-individual-capsule.constant';
import { PaymentMethod, TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';

const PurchasedIndividualCapsuleSchema = new Schema<IPurchasedIndividualCapsule>(
  {
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualCapsule',
      required: [true, 'capsuleId is required'],
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },
    status: {
      type: String,
      enum: [
        TPurchasedIndividualCapsuleStatus.start,
        TPurchasedIndividualCapsuleStatus.inProgress,
        TPurchasedIndividualCapsuleStatus.complete,
      ],
      required: [true, 'status is required'],
    },
    isGifted: {
      type: Boolean,
      required: [true, 'isGifted is required'],
    },
    uploadedCertificate: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
        required: [false, 'uploadedCertificate is not required'],
      },
    ],
    price: {
      type: Number,
      required: [true, 'price is required'],
    },
    isCertificateUploaded: {
      type: Boolean,
      required: [true, 'isCertificateUploaded is required'],
    },
    completedModules: {
      type: Number,
      required: [false, 'completedModules is not required'],
      min: [0, 'completedModules cannot be negative'],
    },
    totalModules: {
      type: Number,
      required: [true, 'totalModules is required'],
      min: [0, 'totalModules cannot be negative'],
    },
    completedLessons: {
      type: Number,
      required: [false, 'completedLessons is not required'],
      min: [0, 'completedLessons cannot be negative'],
    },
    totalLessons: {
      type: Number,
      required: [false, 'totalLessons is not required'],
      min: [0, 'totalLessons cannot be negative'],
    },
    completionDate: {
      type: Date,
      required: [false, 'completionDate is not required'],
    },
    progressPercent: {
      type: Number,
      required: [false, 'progressPercent is not required'],
      min: [0, 'progressPercent cannot be less than 0'],
      max: [100, 'progressPercent cannot exceed 100'],
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
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

PurchasedIndividualCapsuleSchema.plugin(paginate);
PurchasedIndividualCapsuleSchema.plugin(toJSON);

export const PurchasedIndividualCapsule = model<
  IPurchasedIndividualCapsule,
  IPurchasedIndividualCapsuleModel
>('PurchasedIndividualCapsule', PurchasedIndividualCapsuleSchema);
