//@ts-ignore
import { model, Schema } from 'mongoose';
import { IUserProfile, IUserProfileModel } from './userProfile.interface';
import toJSON from '../../../common/plugins/toJSON';

const userProfileSchema = new Schema<IUserProfile>({
    
    acceptTOC:{ // for mentor and student
        type: Boolean,
        required: [false, 'acceptTOC is not required'],
    },

    userId: { //🔗 for back reference .. 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
}, {
    versionKey: false,
});

// Apply the toJSON plugin
userProfileSchema.plugin(toJSON);

// userProfileSchema.index({ locationV2: "2dsphere" });

export const UserProfile = model<IUserProfile, IUserProfileModel>('UserProfile', userProfileSchema);