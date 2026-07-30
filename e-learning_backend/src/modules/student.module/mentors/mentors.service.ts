import httpStatus from 'http-status';
import mongoose from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { MentorProfile } from '../../mentor.module/mentorProfile/mentorProfile.model';
import { IMentorProfile } from '../../mentor.module/mentorProfile/mentorProfile.interface';
import { MentorReview } from '../../mentor.module/mentorReview/mentorReview.model';
import { User } from '../../user.module/user/user.model';
import { StudentMentor } from '../../studentMentor/studentMentor.model';
import { MentorSession } from './mentor-session.model';

interface IGenericResponse<T> {
  results: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

interface RatingBreakdown {
  5: number;
  4: number;
  3: number;
  2: number;
  1: number;
}

const paginateResults = (
  results: any[],
  total: number,
  page: number,
  limit: number,
): IGenericResponse<any> => {
  return {
    results,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getBookSessionAgainStudents = async (
  mentorId: string,
  page: number = 1,
  limit: number = 10,
): Promise<IGenericResponse<any>> => {
  const studentMentorRelations = await StudentMentor.find({
    mentorId,
    isDeleted: false,
  })
    .populate('studentId', 'name email profileImage')
    .lean();

  if (studentMentorRelations.length === 0) {
    return paginateResults([], 0, page, limit);
  }

  const studentIds = studentMentorRelations.map((r: any) => r.studentId);

  const mentors = await MentorProfile.find({
    userId: { $in: studentIds },
    isLive: true,
    haveAdminApproval: 'approved',
    isDeleted: false,
  })
    .populate('userId', 'name email profileImage')
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = studentIds.length;

  return paginateResults(mentors, total, page, limit);
};

const getRecommendedMentorsForMentor = async (
  mentorId: string,
  page: number = 1,
  limit: number = 10,
): Promise<IGenericResponse<any>> => {
  const total = await MentorProfile.countDocuments({
    isLive: true,
    haveAdminApproval: 'approved',
    isDeleted: false,
  });

  const mentors = await MentorProfile.find({
    isLive: true,
    haveAdminApproval: 'approved',
    isDeleted: false,
  })
    .sort({ rating: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(
      'avatarUrl rating location language availableIn bio sessionPrice currentJobTitle companyName yearsOfExperience topics language coreValues specialties coachingMethodologies careerStage focusArea industry',
    )
    .populate('userId', 'name')
    .lean();

  const formattedMentors = mentors.map((mentor: any) => ({
    mentorId: mentor._id,
    avatarUrl: mentor.avatarUrl,
    name: mentor.userId?.name || '',
    avgRating: mentor.rating || 0,
    location: mentor.location,
    language: mentor.language,
    availableIn: mentor.availableIn,
    bio: mentor.bio,
    sessionPrice: mentor.sessionPrice,
    currentJobTitle: mentor.currentJobTitle,
    companyName: mentor.companyName,
    yearsOfExperience: mentor.yearsOfExperience,
    topics: mentor.topics,
    coreValues: mentor.coreValues,
    specialties: mentor.specialties,
    methodologies: mentor.coachingMethodologies,
    careerStage: mentor.careerStage,
    focusArea: mentor.focusArea,
    industry: mentor.industry,
  }));

  return paginateResults(formattedMentors, total, page, limit);
};

const getTopMentorsForMentor = async (
  page: number = 1,
  limit: number = 10,
): Promise<IGenericResponse<any>> => {
  const total = await MentorProfile.countDocuments({
    isLive: true,
    haveAdminApproval: 'approved',
    isDeleted: false,
  });

  const mentors = await MentorProfile.find({
    isLive: true,
    haveAdminApproval: 'approved',
    isDeleted: false,
  })
    .sort({ rating: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(
      'avatarUrl rating location language availableIn bio sessionPrice currentJobTitle companyName yearsOfExperience topics language coreValues specialties coachingMethodologies careerStage focusArea industry',
    )
    .populate('userId', 'name')
    .lean();

  const formattedMentors = mentors.map((mentor: any) => ({
    mentorId: mentor._id,
    avatarUrl: mentor.avatarUrl,
    name: mentor.userId?.name || '',
    avgRating: mentor.rating || 0,
    location: mentor.location,
    language: mentor.language,
    availableIn: mentor.availableIn,
    bio: mentor.bio,
    sessionPrice: mentor.sessionPrice,
    currentJobTitle: mentor.currentJobTitle,
    companyName: mentor.companyName,
    yearsOfExperience: mentor.yearsOfExperience,
    topics: mentor.topics,
    coreValues: mentor.coreValues,
    specialties: mentor.specialties,
    methodologies: mentor.coachingMethodologies,
    careerStage: mentor.careerStage,
    focusArea: mentor.focusArea,
    industry: mentor.industry,
  }));

  return paginateResults(formattedMentors, total, page, limit);
};

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

  const mentorUserId = new mongoose.Types.ObjectId(mentor.userId);

  const reviews = await MentorReview.find({
    mentorId: mentorUserId,
    isDeleted: false,
  })
    .populate('userId', 'name profileImage')
    .sort({ createdAt: -1 })
    .limit(2)
    .lean();

  const allReviews = await MentorReview.find({
    mentorId: mentorUserId,
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

  const formattedReviews = reviews.map((review: any) => ({
    reviewerName: review.userId?.name || 'Anonymous',
    reviewerAvatarUrl: review.userId?.profileImage?.imageUrl || '/uploads/users/user.png',
    review: review.review,
    rating: review.rating,
    createdAt: review.createdAt,
  }));

  return {
    avatarUrl: mentor.avatarUrl || user?.profileImage?.imageUrl || '',
    name: user?.name || '',
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
    recentReviews: formattedReviews,
    calendlyProfileLink: mentor.calendlyProfileLink,
  };
};

const submitReview = async (
  mentorId: string,
  studentId: string,
  review: string,
  rating: number,
) => {
  const mentorProfile = await MentorProfile.findById(mentorId);
  
  if (!mentorProfile) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mentor not found');
  }

  const mentorUserId = mentorProfile.userId;

  const existingReview = await MentorReview.findOne({
    mentorId: mentorUserId,
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
    mentorId: mentorUserId,
    userId: new mongoose.Types.ObjectId(studentId),
    review,
    rating,
  });

  if (mentorProfile) {
    const allReviews = await MentorReview.find({
      mentorId: mentorUserId,
      isDeleted: false,
    }).lean();
    const totalRating = allReviews.reduce(
      (sum: number, r: any) => sum + r.rating,
      0,
    );
    const avgRating =
      allReviews.length > 0 ? totalRating / allReviews.length : 0;
    mentorProfile.rating = parseFloat(avgRating.toFixed(1));
    await mentorProfile.save();
  }

  return newReview;
};

const getRecommendedMentorsWithGeneration = async (
  studentId: string,
  page: number = 1,
  limit: number = 10,
): Promise<IGenericResponse<any>> => {
  // Import here to avoid circular dependency
  const { StudentQuestionnaireSummary } = require('../student-dashboard/student-questionnaire-summary.model');
  const { StudentAnswer } = require('../../question.module/studentAnswer/studentAnswer.model');
  const { AIService } = require('../student-dashboard/ai.service');

  const summary = await StudentQuestionnaireSummary.findOne({
    studentId,
    isDeleted: false,
  }).lean();

  let recommendedMentorIds: any[] = [];

  if (!summary || summary.recommendedMentorIds.length === 0) {
    // Generate recommendations if none exist
    if (summary) {
      const answers = await StudentAnswer.find({
        studentId,
        questionaryId: summary.questionaryId,
        isDeleted: false,
      })
        .populate('questionId', 'title')
        .lean();

      const questionsAndAnswers = answers.map((a: any) => ({
        question: a.questionId?.title || '',
        answer: Array.isArray(a.answer) ? a.answer.join(', ') : String(a.answer || ''),
      }));

      const preferences = await AIService.recommendMentors(questionsAndAnswers, {
        title: summary.title,
        texts: summary.texts,
        summary: summary.summary,
      });

      const mentorQuery: any = {
        isLive: true,
        haveAdminApproval: 'approved',
        isDeleted: false,
      };

      if (preferences.length > 0) {
        mentorQuery.$or = [
          { coachingMethodologies: { $in: preferences } },
          { coreValues: { $in: preferences } },
          { specialties: { $in: preferences } },
        ];
      }

      const recommendedMentors = await MentorProfile.find(mentorQuery)
        .sort({ rating: -1 })
        .limit(20)
        .lean();

      recommendedMentorIds = recommendedMentors.map(m => m._id);

      // Store the generated recommendations
      await StudentQuestionnaireSummary.findOneAndUpdate(
        { studentId, isDeleted: false },
        { recommendedMentorIds },
        { new: true },
      );
    }
  } else {
    recommendedMentorIds = summary.recommendedMentorIds;
  }

  // If still no recommendations, fall back to top mentors
  if (recommendedMentorIds.length === 0) {
    return getTopMentorsForMentor(page, limit);
  }

  const total = recommendedMentorIds.length;

  const mentors = await MentorProfile.find({
    _id: { $in: recommendedMentorIds },
    isLive: true,
    haveAdminApproval: 'approved',
    isDeleted: false,
  })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(
      'avatarUrl rating location language availableIn bio sessionPrice currentJobTitle companyName yearsOfExperience topics language coreValues specialties coachingMethodologies careerStage focusArea industry',
    )
    .populate('userId', 'name')
    .lean();

  const formattedMentors = mentors.map((mentor: any) => ({
    mentorId: mentor._id,
    avatarUrl: mentor.avatarUrl,
    name: mentor.userId?.name || '',
    avgRating: mentor.rating || 0,
    location: mentor.location,
    language: mentor.language,
    availableIn: mentor.availableIn,
    bio: mentor.bio,
    sessionPrice: mentor.sessionPrice,
    currentJobTitle: mentor.currentJobTitle,
    companyName: mentor.companyName,
    yearsOfExperience: mentor.yearsOfExperience,
    topics: mentor.topics,
    coreValues: mentor.coreValues,
    specialties: mentor.specialties,
    methodologies: mentor.coachingMethodologies,
    careerStage: mentor.careerStage,
    focusArea: mentor.focusArea,
    industry: mentor.industry,
  }));

  return paginateResults(formattedMentors, total, page, limit);
};

const bookSession = async (mentorId: string, studentId: string) => {
  const mentor: any = await MentorProfile.findOne({
    _id: mentorId,
    isLive: true,
    haveAdminApproval: 'approved',
    isDeleted: false,
  }).populate('userId', 'name').lean();

  if (!mentor) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Mentor not found');
  }

  return {
    sessionPrice: mentor.sessionPrice,
    calendlyProfileLink: mentor.calendlyProfileLink,
    mentorName: mentor.userId?.name || '',
    message: 'Please use the calendly link to book a session',
  };
};

const getMyBookedSessions = async (
  studentId: string,
  page: number = 1,
  limit: number = 10
): Promise<IGenericResponse<any>> => {
  const total = await MentorSession.countDocuments({
    studentId,
    isDeleted: false,
  });

  const sessions = await MentorSession.find({
    studentId,
    isDeleted: false,
  })
    .populate('mentorProfileId')
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const formattedSessions = await Promise.all(
    sessions.map(async (session: any) => {
      const mentorProfile: any = await MentorProfile.findById(
        session.mentorProfileId
      ).populate('userId', 'name').lean();

      return {
        mentorSessionId: session._id,
        mentorId: session.mentorProfileId,
        mentorName: mentorProfile?.userId?.name || '',
        sessionPrice: session.price,
        paymentStatus: session.paymentStatus,
        calendlyProfileLink: mentorProfile?.calendlyProfileLink || null,
        calendlyEventId: session.calendlyEventId,
        calendlyInviteeId: session.calendlyInviteeId,
        calendlyEventUri: session.calendlyEventUri,
        calendlyInviteeUri: session.calendlyInviteeUri,
        calendlyCancelUrl: session.calendlyCancelUrl,
        calendlyRescheduleUrl: session.calendlyRescheduleUrl,
        createdAt: session.createdAt,
      };
    })
  );

  return paginateResults(formattedSessions, total, page, limit);
};

export const MentorsService = {
  getBookSessionAgainStudents,
  getRecommendedMentorsForMentor,
  getRecommendedMentorsWithGeneration,
  getTopMentorsForMentor,
  getMentorDetails,
  submitReview,
  bookSession,
  getMyBookedSessions,
};
