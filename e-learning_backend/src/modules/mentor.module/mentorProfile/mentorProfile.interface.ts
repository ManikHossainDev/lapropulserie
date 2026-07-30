import { Model, Types } from 'mongoose';
import { PaginateOptions, PaginateResult } from '../../../types/paginate';
import { THaveAdminApproval, TMentorClass } from './mentorProfile.constant';


export interface IMentorProfile {
  // _taskId: undefined | Types.ObjectId;
  _id?: Types.ObjectId; // undefined |  Types.ObjectId |

  attachments?: Types.ObjectId[];
  title: string;
  topics: string[];
  userId: Types.ObjectId;
  //mentorCategoryId: Types.ObjectId;   //❌ tasmia apu remove the category
  language: string[];

  // Basic Info (Step 1)
  name?: string;
  location: string;
  availableIn: TMentorClass;

  sessionPrice: number;
  currentJobTitle: string;
  companyName: string;
  yearsOfExperience: number;
  bio: string;

  //------------------ Mission (Step 2)

  careerStage: string[];
  focusArea: string[];
  industry: string[];

  // ----------------- Inner Fuel (Step 3)

  coreValues: string[];
  specialties: string[];

  // ---------------- Methods (Step 4)

  coachingMethodologies: string[];
  calendlyProfileLink: string;

  // Social Links
  facebookLink?: string;
  instagramLink?: string;
  twitterLink?: string;

  // Profile Picture
  avatarUrl?: string;

  // --------------- Go Live (Step 5)

  profileInfoFillUpCount: number;
  rating: number;

  //🆕
  haveAdminApproval: THaveAdminApproval;
  isLive: boolean;
  requestDate?: Date;
  interviewScheduledAt?: Date | null;
  reviewedAt?: Date | null;
  rejectionReason?: string | null;

  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMentorProfileModel extends Model<IMentorProfile> {
  paginate: (
    query: Record<string, any>,
    options: PaginateOptions
  ) => Promise<PaginateResult<IMentorProfile>>;
}
