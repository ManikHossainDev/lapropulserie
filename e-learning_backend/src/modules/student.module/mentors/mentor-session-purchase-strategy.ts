import { TTransactionFor } from "../../../constants/TTransactionFor";
import { TCurrency } from "../../../enums/payment";
import ApiError from "../../../errors/ApiError";
import { PurchaseStrategy } from "../../payment.module/payment/purchaseStrategy/purchaseStrategy.abstract";
import { TPaymentStatus } from "../../payment.module/paymentTransaction/paymentTransaction.constant";
import { IUser } from "../../token/token.interface";
import { IMentorProfile } from "../../mentor.module/mentorProfile/mentorProfile.interface";
import { MentorProfile } from "../../mentor.module/mentorProfile/mentorProfile.model";
import { MentorSession } from "./mentor-session.model";
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

export class MentorSessionPurchaseStrategy extends PurchaseStrategy<IMentorProfile> {

  async checkAlreadyPurchased(mentorProfileId: string, userId: string): Promise<boolean> {
    return !!await MentorSession.findOne({
      mentorProfileId,
      studentId: userId,
      paymentStatus: TPaymentStatus.completed,
    });
  }

  async findExisting(mentorProfileId: string): Promise<IMentorProfile | null> {
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(mentorProfileId);
    } catch (e) {
      console.log('Invalid mentor ID format:', mentorProfileId);
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid mentor ID format. Please use a valid MongoDB ObjectId (e.g., from /student-dashboard/top-mentors endpoint)');
    }

    const mentor = await MentorProfile.findById(objectId).lean();
    if (!mentor) {
      console.log('Mentor not found with ID:', mentorProfileId);
      throw new ApiError(StatusCodes.NOT_FOUND, 'Mentor profile not found with this ID');
    }

    if (!mentor.isLive) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Mentor profile is not live');
    }

    if (mentor.haveAdminApproval !== 'approved') {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Mentor is not approved for booking. Current status: ${mentor.haveAdminApproval}`);
    }

    console.log('Mentor found:', mentor._id, 'name:', mentor.userId);
    return mentor as any;
  }

  async createPendingPurchase(mentor: IMentorProfile, user: IUser, session: any): Promise<any> {
    const result = await MentorSession.create({
      mentorProfileId: mentor._id,
      studentId: user.userId,
      paymentStatus: TPaymentStatus.pending,
      price: Number(mentor.sessionPrice),
      paymentTransactionId: null,
      calendlyEventId: null,
      calendlyInviteeId: null,
      calendlyEventUri: null,
      calendlyInviteeUri: null,
      calendlyCancelUrl: null,
      calendlyRescheduleUrl: null,
      isDeleted: false,
    });

    if (!result) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Mentor session purchase failed!");
    }

    return result;
  }

  getMetadata(purchase: any, mentor: IMentorProfile, user: IUser) {
    return {
      referenceId: purchase._id.toString(),
      referenceFor: TTransactionFor.MentorSession,
      referenceId2: mentor._id?.toString() || '',
      referenceFor2: 'MentorProfile',
      amount: purchase.price.toString(),
      currency: TCurrency.eur,
      user: JSON.stringify(user),
    };
  }
}