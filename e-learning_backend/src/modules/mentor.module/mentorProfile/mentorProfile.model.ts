//@ts-ignore
import { model, Schema } from 'mongoose';
import { IMentorProfile, IMentorProfileModel } from './mentorProfile.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';
import { THaveAdminApproval, TMentorClass } from './mentorProfile.constant';

const MentorProfileSchema = new Schema<IMentorProfile>(
  {
    title: {
      type: String,
      required: [false, 'title is not required'],
    },

    topics: {
      type: [String],
      required: [false, 'topics is not required'],
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },
    language: {
      type: [String],
      required: [false, 'language is not required'],
    },

    location: {
      type: String,
      required: [false, 'location is not required'],
    },

    availableIn: {
      type: String,
      enum: [TMentorClass.online, TMentorClass.inPerson, TMentorClass.both],
      required: [
        false,
        `classType is not required it can be ${Object.values(TMentorClass).join(', ')}`,
      ],
    },

    sessionPrice: {
      type: Number,
      required: [false, 'sessionPrice is not required'],
      // min: [0, 'sessionPrice cannot be negative'],
    },
    currentJobTitle: {
      type: String,
      required: [false, 'currentJobTitle is not required'],
    },
    companyName: {
      type: String,
      required: [false, 'companyName is not required'],
    },
    yearsOfExperience: {
      type: Number,
      required: [false, 'yearsOfExperience is not required'],
      min: [0, 'yearsOfExperience cannot be negative'],
    },

    bio: {
      type: String,
      required: [false, 'bio is not required'],
    },

    careerStage: {
      type: [String],
      required: [false, 'careerStage is not required'],
    },
    focusArea: {
      type: [String],
      required: [false, 'focusArea is not required'],
    },
    industry: {
      type: [String],
      required: [false, 'industry is not required'],
    },

    coreValues: {
      type: [String],
      required: [false, 'coreValues is not required'],
    },
    specialties: {
      type: [String],
      required: [false, 'specialties is not required'],
    },

    coachingMethodologies: {
      type: [String],
      required: [false, 'coachingMethodologies is not required'],
    },

    calendlyProfileLink: {
      type: String,
      required: [false, 'calendlyProfileLink is not required'],
    },
    facebookLink: {
      type: String,
      required: [false, 'facebookLink is not required'],
    },
    instagramLink: {
      type: String,
      required: [false, 'instagramLink is not required'],
    },
    twitterLink: {
      type: String,
      required: [false, 'twitterLink is not required'],
    },
    avatarUrl: {
      type: String,
      required: [false, 'avatarUrl is not required'],
    },

    /**
     *
     * backend e data save korar shomoy
     * dekhte hobe ..
     * ei ei question er answer
     * send korle ..
     *
     * profileInfoFillUpCount
     *
     * ei ta hobe ..
     *
     * every time profileInfoFillUpCount
     * set korar shomoy ..
     *
     * new value >= previous value hoite
     * hobe
     *
     */
    profileInfoFillUpCount: {
      type: Number,
      required: [false, 'profileInfoFillUpCount is not required'],
      min: [0, 'profileInfoFillUpCount cannot be negative'],
    },

    // may be we dont need this
    rating: {
      type: Number,
      required: [false, 'rating is not required'],
      min: [0, 'rating cannot be less than 0'],
      max: [5, 'rating cannot exceed 5'],
    },

    // 🆕 new logic ..
    haveAdminApproval: {
      type: String,
      enum: [
        THaveAdminApproval.none,
        THaveAdminApproval.inRequest,
        THaveAdminApproval.approved,
        THaveAdminApproval.rejected,
      ],
      required: [
        false,
        `haveAdminApproval is not required it can be ${Object.values(THaveAdminApproval).join(', ')}`,
      ],
      default: THaveAdminApproval.none,
    },

    requestDate: {
      //🆕
      type: Date,
      required: [false, 'requestDate is not required.'],
    },
    interviewScheduledAt: {
      type: Date,
      required: false,
      default: null,
    },
    reviewedAt: {
      type: Date,
      required: false,
      default: null,
    },
    rejectionReason: {
      type: String,
      required: false,
      default: null,
      trim: true,
    },

    // 🆕
    isLive: {
      type: Boolean,
      required: [false, 'isLive is not required'],
      default: false,
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

MentorProfileSchema.plugin(paginate);
MentorProfileSchema.plugin(toJSON);


export const MentorProfile = model<
  IMentorProfile,
  IMentorProfileModel
>('MentorProfile', MentorProfileSchema);
