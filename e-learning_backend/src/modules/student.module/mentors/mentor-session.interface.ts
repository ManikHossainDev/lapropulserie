import { Model, Document, Schema as MongoSchema } from 'mongoose';
import { TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';

export interface IMentorSession {
  mentorProfileId: MongoSchema.Types.ObjectId;
  studentId: string;
  paymentStatus: TPaymentStatus;
  price: number;
  paymentTransactionId: string | null;
  calendlyEventId: string | null;
  calendlyInviteeId: string | null;
  calendlyEventUri: string | null;
  calendlyInviteeUri: string | null;
  calendlyCancelUrl: string | null;
  calendlyRescheduleUrl: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMentorSessionModel extends Model<IMentorSession, Record<string, unknown>> {
  findByMentorAndStudent(mentorProfileId: string, studentId: string): Promise<IMentorSession | null>;
}