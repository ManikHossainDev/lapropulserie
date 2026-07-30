import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { MentorProfile } from '../../mentor.module/mentorProfile/mentorProfile.model';
import { IMentorProfile } from '../../mentor.module/mentorProfile/mentorProfile.interface';
import { MentorReview } from '../../mentor.module/mentorReview/mentorReview.model';
import { User } from '../../user.module/user/user.model';

interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

const getMentorDetails = async (mentorId: string) => {
  const mentor = await MentorProfile.findOne({
    _id: mentorId,
    isLive: true,
    haveAdminApproval: 'approved',
    isDeleted: false,
  }).lean();

  if (!mentor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mentor not found');
  }

  const user = await User.findById(mentor.userId)
    .select('name email profileImage')
    .lean();

  const reviews = await MentorReview.find({
    mentorId: mentor._id,
    isDeleted: false,
  })
    .populate('userId', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(2)
    .lean();

  const allReviews = await MentorReview.find({
    mentorId: mentor._id,
    isDeleted: false,
  }).lean();
  const totalReviews = allReviews.length;

  const ratingBreakdown: RatingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  allReviews.forEach((review: any) => {
    const roundedRating = Math.round(review.rating);
    if (roundedRating >= 1 && roundedRating <= 5) {
      ratingBreakdown[roundedRating as keyof RatingBreakdown]++;
    }
  });

  const totalRatingCount = allReviews.reduce(
    (sum: number, r: any) => sum + r.rating,
    0,
  );
  const avgRating = totalReviews > 0 ? totalRatingCount / totalReviews : 0;

  return {
    avatarUrl: mentor.avatarUrl || user?.profileImage?.imageUrl || '',
    name: mentor.name || user?.name || '',
    currentJobTitle: mentor.currentJobTitle,
    companyName: mentor.companyName,
    sessionPrice: mentor.sessionPrice,
    avgRating: parseFloat(avgRating.toFixed(1)),
    totalRatingCount: totalReviews,
    location: mentor.location,
    language: mentor.language,
    availableIn: mentor.availableIn,
    facebookLink: mentor.facebookLink,
    instagramLink: mentor.instagramLink,
    twitterLink: mentor.twitterLink,
    bio: mentor.bio,
    values: mentor.coreValues,
    specialties: mentor.specialties,
    methodologies: mentor.coachingMethodologies,
    ratingBreakdown: {
      fiveStar:
        totalReviews > 0
          ? Math.round((ratingBreakdown[5] / totalReviews) * 100)
          : 0,
      fourStar:
        totalReviews > 0
          ? Math.round((ratingBreakdown[4] / totalReviews) * 100)
          : 0,
      threeStar:
        totalReviews > 0
          ? Math.round((ratingBreakdown[3] / totalReviews) * 100)
          : 0,
      twoStar:
        totalReviews > 0
          ? Math.round((ratingBreakdown[2] / totalReviews) * 100)
          : 0,
      oneStar:
        totalReviews > 0
          ? Math.round((ratingBreakdown[1] / totalReviews) * 100)
          : 0,
    },
    recentReviews: reviews,
    calendlyProfileLink: mentor.calendlyProfileLink,
  };
};

const submitReview = async (
  mentorId: string,
  studentId: string,
  review: string,
  rating: number,
) => {
  const existingReview = await MentorReview.findOne({
    mentorId,
    userId: studentId,
    isDeleted: false,
  });

  if (existingReview) {
    existingReview.review = review;
    existingReview.rating = rating;
    await existingReview.save();
    return existingReview;
  }

  const newReview = await MentorReview.create({
    mentorId: new mongoose.Types.ObjectId(mentorId),
    userId: new mongoose.Types.ObjectId(studentId),
    review,
    rating,
  });

  const mentor = await MentorProfile.findById(mentorId);
  if (mentor) {
    const allReviews = await MentorReview.find({
      mentorId,
      isDeleted: false,
    }).lean();
    const totalRating = allReviews.reduce(
      (sum: number, r: any) => sum + r.rating,
      0,
    );
    const avgRating =
      allReviews.length > 0 ? totalRating / allReviews.length : 0;
    mentor.rating = parseFloat(avgRating.toFixed(1));
    await mentor.save();
  }

  return newReview;
};

const bookSession = async (mentorId: string, studentId: string) => {
  const mentor = await MentorProfile.findOne({
    _id: mentorId,
    isLive: true,
    haveAdminApproval: 'approved',
    isDeleted: false,
  });

  if (!mentor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mentor not found');
  }

  return {
    sessionPrice: mentor.sessionPrice,
    calendlyProfileLink: mentor.calendlyProfileLink,
    mentorName: mentor.name,
    message: 'Please use the calendly link to book a session',
  };
};

export const MentorDetailsService = {
  getMentorDetails,
  submitReview,
  bookSession,
};
