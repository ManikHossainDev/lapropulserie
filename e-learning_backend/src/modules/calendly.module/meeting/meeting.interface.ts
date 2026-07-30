import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';

export type TMeetingStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface IMeeting {
  _id?: Types.ObjectId;
  calendlyEventId: string;
  calendlyInviteeId: string;
  mentorId: Types.ObjectId;
  studentEmail: string;
  studentName?: string | null;
  eventType?: string | null;
  scheduledAt: Date;
  duration?: number | null;
  location?: string | null;
  status: TMeetingStatus;
  cancelledAt?: Date | null;
  rawPayload?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMeetingModel extends Model<IMeeting> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions,
  ) => Promise<PaginateResult<IMeeting>>;
}
