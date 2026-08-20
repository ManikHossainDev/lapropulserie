import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { MentorProfile } from '../../mentor.module/mentorProfile/mentorProfile.model';
import { IMentorProfile } from '../../mentor.module/mentorProfile/mentorProfile.interface';
import { IndividualCapsuleCategory } from '../../individualCapsule.module/individual-capsule-category/individual-capsule-category.model';
import { IndividualCapsule } from '../../individualCapsule.module/individual-capsule/individual-capsule.model';
import { IndividualModule } from '../../individualCapsule.module/individual-module/individual-module.model';
import { IndividualLesson } from '../../individualCapsule.module/individual-lesson/individual-lesson.model';
import { IndividualModuleProgress } from '../../individualCapsule.module/individual-module-progress/individual-module-progress.model';
import { TIndividualModuleProgress } from '../../individualCapsule.module/individual-module-progress/individual-module-progress.constant';
import { LessonProgress } from '../../individualCapsule.module/individual-lesson-progress/individual-lesson-progress.model';
import { TLessonProgress } from '../../individualCapsule.module/individual-lesson-progress/individual-lesson-progress.constant';
import { PurchasedIndividualCapsule } from '../../individualCapsule.module/purchased-individual-capsule/purchased-individual-capsule.model';
import { StudentQuestionnaireSummary } from './student-questionnaire-summary.model';
import { AIService } from './ai.service';
import { StudentAnswer } from '../../question.module/studentAnswer/studentAnswer.model';
import { PurchasedJourney } from '../../journey.module/purchased-journey/purchased-journey.model';
import { JourneyCapsule } from '../../journey.module/journey-capsule/journey-capsule.model';
import { MariiReport } from '../../individualCapsule.module/marii-report/marii-report.model';
import { TPaymentStatus } from '../../payment.module/paymentTransaction/paymentTransaction.constant';
import { Questionary } from '../../question.module/questionary/questionary.model';
import { Question } from '../../question.module/question/question.model';
import { TQuestionaryCategory } from '../../question.module/question.constant';
import {
  buildTemplateQuestionnaireSummary,
  formatAnswerValue,
  QuestionnaireSummarySection,
} from './questionnaire-summary.utils';
import {
  collectStudentProfileText,
  getPersonalizedRecommendations,
  scoreContentAgainstThemes,
} from './recommendations.service';
import { scoreThemesWithWeights } from '../../individualCapsule.module/marii-report/marii-report.utils';
import { resolveLearnerFirstName } from '../../individualCapsule.module/marii-report/learner-name.helper';
import { StudentMentor } from '../../studentMentor/studentMentor.model';
import {
  getJourneyLinkedIndividualCapsuleIds,
  isJourneyOnlyDiscoverCategory,
} from '../../individualCapsule.module/shared/capsule-access.helper';

interface IGenericResponse<T> {
  results: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
}

type CapsuleAccessType = 'purchased' | 'gifted' | 'suggested';

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
      totalPage: Math.ceil(total / limit) || 1,
    },
  };
};

const ensureObjectId = (value: string, label: string) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, `${label} is invalid`);
  }

  return new mongoose.Types.ObjectId(value);
};

const generateAndStoreMentorRecommendations = async (studentId: string) => {
  const summary = await StudentQuestionnaireSummary.findOne({
    studentId,
    isDeleted: false,
  }).lean();
  if (!summary) return null;

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

  let recommendedMentors = await MentorProfile.find(mentorQuery)
    .sort({ rating: -1 })
    .limit(20)
    .lean();

  if (recommendedMentors.length === 0 && mentorQuery.$or) {
    delete mentorQuery.$or;
    recommendedMentors = await MentorProfile.find(mentorQuery)
      .sort({ rating: -1 })
      .limit(20)
      .lean();
  }

  const recommendedMentorIds = recommendedMentors.map(m => m._id);
  if (recommendedMentorIds.length > 0) {
    await StudentQuestionnaireSummary.findOneAndUpdate(
      { studentId, isDeleted: false },
      { recommendedMentorIds },
      { new: true },
    );
  }

  return recommendedMentorIds.map(id => id?.toString());
};

const getTopMentors = async (
  page: number = 1,
  limit: number = 10,
): Promise<IGenericResponse<IMentorProfile>> => {
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
    .lean();

  return paginateResults(
    mentors as Partial<IMentorProfile>[],
    total,
    page,
    limit,
  );
};

interface CapsuleCategory {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  thumbnail?: string;
  capsuleCount?: number;
}

const getCapsuleCategories = async (
  page: number = 1,
  limit: number = 10,
): Promise<IGenericResponse<any>> => {
  const journeyLinkedIds = await getJourneyLinkedIndividualCapsuleIds();

  const categories = await IndividualCapsuleCategory.find({
    isDeleted: false,
    sellIndividually: { $ne: false },
  }).lean();

  const discoverCategories = [];
  for (const cat of categories as any[]) {
    if (isJourneyOnlyDiscoverCategory(cat)) continue;

    const capsules = await IndividualCapsule.find({
      capsuleCategoryId: cat._id,
      isDeleted: false,
    })
      .select('_id')
      .lean();

    const individualCount = capsules.filter(
      (capsule: any) => !journeyLinkedIds.has(String(capsule._id)),
    ).length;

    if (capsules.length > 0 && individualCount === 0) continue;

    discoverCategories.push({ ...cat, capsuleCount: individualCount });
  }

  const total = discoverCategories.length;
  const paged = discoverCategories.slice((page - 1) * limit, page * limit);
  return paginateResults(paged as CapsuleCategory[], total, page, limit);
};

interface CapsuleListItem {
  _id: mongoose.Types.ObjectId;
  title: string;
  level: string;
  description: string;
  thumbnail?: string;
  price: number;
  numberOfModules: number;
  averageRating?: number;
  totalReviews?: number;
}

const getCapsules = async (
  categoryId?: string,
  ratingFilter?: number,
  page: number = 1,
  limit: number = 10,
  studentId?: string,
): Promise<IGenericResponse<any>> => {
  const query: any = { isDeleted: false };

  if (categoryId) {
    const categoryObjectId = ensureObjectId(categoryId, 'categoryId');
    const category = await IndividualCapsuleCategory.findOne({
      _id: categoryObjectId,
      isDeleted: false,
    })
      .select('title sellIndividually')
      .lean();

    if (!category || isJourneyOnlyDiscoverCategory(category)) {
      return paginateResults([], 0, page, limit);
    }

    query.capsuleCategoryId = categoryObjectId;
  }

  const journeyLinkedIds = await getJourneyLinkedIndividualCapsuleIds();
  if (journeyLinkedIds.size > 0) {
    query._id = {
      $nin: Array.from(journeyLinkedIds).map(
        id => new mongoose.Types.ObjectId(id),
      ),
    };
  }

  const total = await IndividualCapsule.countDocuments(query);

  let capsules = await IndividualCapsule.find(query)
    .select('title thumbnail capsuleCategoryId price capsuleType')
    .populate('capsuleCategoryId', 'title price estimatedDuration sellIndividually capsuleType')
    .sort({ title: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  if (ratingFilter !== undefined) {
    capsules = capsules.filter(c => (c as any).averageRating >= ratingFilter);
  }

  let purchasedIds = new Set<string>();
  if (studentId) {
    const purchases = await PurchasedIndividualCapsule.find({
      studentId: ensureObjectId(studentId, 'studentId'),
      capsuleId: { $in: capsules.map(c => c._id) },
      paymentStatus: TPaymentStatus.completed,
      isDeleted: false,
    })
      .select('capsuleId')
      .lean();
    purchasedIds = new Set(purchases.map(p => String(p.capsuleId)));
  }

  const enriched = capsules.map(cap => {
    const category = cap.capsuleCategoryId as any;
    const effectivePrice =
      cap.price != null ? Number(cap.price) : Number(category?.price ?? 0);
    const isFree = !Number.isFinite(effectivePrice) || effectivePrice <= 0;
    const isPurchased = purchasedIds.has(String(cap._id));
    return {
      ...cap,
      price: Number.isFinite(effectivePrice) ? effectivePrice : 0,
      isFree,
      isPurchased,
      canAccessContent: isFree || isPurchased,
    };
  });

  return paginateResults(enriched, total, page, limit);
};

const getExplorationCapsuleCompletion = async (
  studentId: mongoose.Types.ObjectId,
  journeyId: mongoose.Types.ObjectId,
) => {
  const capsules = await JourneyCapsule.find({
    journeyId,
    isDeleted: false,
    individualCapsuleId: { $exists: true, $ne: null },
  })
    .select('title capsuleNumber individualCapsuleId')
    .sort({ capsuleNumber: 1 })
    .lean();

  if (!capsules.length) {
    return {
      capsules: [],
      completedCount: 0,
      totalCount: 0,
      percent: 0,
      currentCapsule: null,
      allComplete: false,
    };
  }

  const individualIds = capsules.map(c => c.individualCapsuleId);
  const reports = await MariiReport.find({
    studentId,
    capsuleId: { $in: individualIds },
    isDeleted: false,
  })
    .select('capsuleId')
    .lean();

  const completedIds = new Set(reports.map(r => String(r.capsuleId)));
  const completedCount = capsules.filter(c =>
    completedIds.has(String(c.individualCapsuleId)),
  ).length;
  const currentCapsule =
    capsules.find(c => !completedIds.has(String(c.individualCapsuleId))) ||
    capsules[capsules.length - 1];
  const currentComplete = completedIds.has(
    String(currentCapsule?.individualCapsuleId),
  );

  return {
    capsules,
    completedCount,
    totalCount: capsules.length,
    percent: Math.round((completedCount / capsules.length) * 100),
    currentCapsule,
    currentCapsuleProgress: currentComplete ? 100 : 0,
    allComplete: completedCount === capsules.length,
  };
};

const getStudentProgress = async (studentId: string) => {
  const studentObjectId = ensureObjectId(studentId, 'studentId');
  const purchasedJourneys = await PurchasedJourney.find({
    studentId: studentObjectId,
    paymentStatus: TPaymentStatus.completed,
    isDeleted: false,
  })
    .populate('journeyId', 'title')
    .sort({ createdAt: -1 })
    .lean();

  if (purchasedJourneys.length === 0) {
    return {
      currentCapsuleProgress: 0,
      overallJourneyProgress: 0,
      currentCapsuleName: null,
    };
  }

  const currentJourney = purchasedJourneys[0];
  const journeyRef = currentJourney?.journeyId as any;
  const journeyId = journeyRef?._id || journeyRef;

  if (!journeyId) {
    return {
      currentCapsuleProgress: 0,
      overallJourneyProgress: 0,
      currentCapsuleName: null,
    };
  }

  const completion = await getExplorationCapsuleCompletion(
    studentObjectId,
    journeyId,
  );

  if (completion.allComplete && currentJourney.overallStatus !== 'completed') {
    await PurchasedJourney.updateOne(
      { _id: currentJourney._id, overallStatus: { $ne: 'completed' } },
      {
        $set: {
          overallStatus: 'completed',
          completionDate: currentJourney.completionDate || new Date(),
          progressPercentage: 100,
          completedCapsules: completion.completedCount,
          totalCapsules: completion.totalCount,
        },
      },
    );
  }

  return {
    currentCapsuleProgress: completion.currentCapsuleProgress || 0,
    overallJourneyProgress: completion.percent,
    currentCapsuleName: completion.currentCapsule?.title || null,
  };
};

const getMyMentors = async (studentId: string, page: number = 1, limit: number = 10) => {
  const { MentorsService } = require('../mentors/mentors.service');
  const studentObjectId = ensureObjectId(studentId, 'studentId');

  const recommended = await MentorsService.getRecommendedMentorsWithGeneration(
    studentId,
    1,
    50,
  );
  const recResults: any[] = recommended?.results || [];

  const bookedRelations = await StudentMentor.find({
    studentId: studentObjectId,
    isDeleted: false,
  }).lean();
  const bookedUserIds = bookedRelations.map((sm: any) => sm.mentorId);

  let bookedProfiles: any[] = [];
  if (bookedUserIds.length > 0) {
    bookedProfiles = await MentorProfile.find({
      userId: { $in: bookedUserIds },
      isLive: true,
      haveAdminApproval: 'approved',
      isDeleted: false,
    })
      .populate('userId', 'name profileImage')
      .select('avatarUrl currentJobTitle companyName userId')
      .lean();
  }

  const recIds = new Set(recResults.map((m: any) => String(m.mentorId)));
  const extraBooked = bookedProfiles
    .filter((profile: any) => !recIds.has(String(profile._id)))
    .map((mentor: any) => {
      const designation =
        mentor.currentJobTitle || mentor.companyName || 'Mentor';
      return {
        mentorId: mentor._id,
        avatarUrl:
          mentor.avatarUrl || mentor.userId?.profileImage?.imageUrl || '',
        name: mentor.userId?.name || '',
        designation,
        role: designation,
        currentJobTitle: mentor.currentJobTitle,
        companyName: mentor.companyName,
      };
    });

  const allMentors = [
    ...extraBooked,
    ...recResults.map((mentor: any) => {
      const designation =
        mentor.designation ||
        mentor.role ||
        mentor.currentJobTitle ||
        mentor.companyName ||
        'Mentor';
      return {
        ...mentor,
        designation,
        role: designation,
      };
    }),
  ];

  const total = allMentors.length;
  const paged = allMentors.slice((page - 1) * limit, page * limit);
  return paginateResults(paged, total, page, limit);
};

const getCompletedJourneys = async (studentId: string, page: number = 1, limit: number = 10) => {
  const studentObjectId = ensureObjectId(studentId, 'studentId');
  const purchases = await PurchasedJourney.find({
    studentId: studentObjectId,
    paymentStatus: TPaymentStatus.completed,
    isDeleted: false,
  })
    .populate('journeyId', 'title thumbnail')
    .sort({ completionDate: -1, createdAt: -1 })
    .lean();

  const completedJourneys = [];
  for (const purchase of purchases) {
    const journeyRef = purchase.journeyId as any;
    const journeyId = journeyRef?._id || journeyRef;
    if (!journeyId) continue;

    const completion = await getExplorationCapsuleCompletion(
      studentObjectId,
      journeyId,
    );
    if (!completion.allComplete) continue;

    completedJourneys.push({
      title: journeyRef?.title || 'Parcours Exploration',
      completedDate: purchase.completionDate || purchase.updatedAt,
      journeyId,
      thumbnail: journeyRef?.thumbnail || '',
    });
  }

  const total = completedJourneys.length;
  const paged = completedJourneys.slice((page - 1) * limit, page * limit);
  return paginateResults(paged, total, page, limit);
};

const formatCapsuleCard = (
  capsule: any,
  accessType: CapsuleAccessType,
  purchase?: any | null,
  extras: {
    purchaseSource?: 'individual' | 'expedition';
    journeyId?: string | null;
  } = {},
) => {
  const rating = capsule.averageRating || 0;
  return {
    capsuleId: capsule._id,
    title: capsule.title,
    level: capsule.level,
    description: capsule.description,
    thumbnail: capsule.thumbnail || '',
    price: capsule.price,
    numberOfModules: capsule.numberOfModules,
    averageRating: rating,
    avgRating: rating,
    totalReviewCount: capsule.totalReviewCount || 0,
    category: (capsule.capsuleCategoryId as any)?.title || '',
    categoryId:
      (capsule.capsuleCategoryId as any)?._id ||
      capsule.capsuleCategoryId ||
      null,
    accessType,
    purchaseSource: extras.purchaseSource || (accessType === 'suggested' ? null : 'individual'),
    journeyId: extras.journeyId || null,
    isPurchased: accessType !== 'suggested',
    isGifted: accessType === 'gifted',
    progressPercent: purchase?.progressPercent || 0,
    completedModules: purchase?.completedModules || 0,
    totalModules: purchase?.totalModules || capsule.numberOfModules || 0,
    completedLessons: purchase?.completedLessons || 0,
    totalLessons: purchase?.totalLessons || 0,
    purchaseStatus: purchase?.status || null,
    purchasedAt: purchase?.createdAt || null,
  };
};

const getExpeditionCapsuleLinks = async (studentId: string) => {
  const studentObjectId = ensureObjectId(studentId, 'studentId');

  const journeyPurchases = await PurchasedJourney.find({
    studentId: studentObjectId,
    paymentStatus: TPaymentStatus.completed,
    isDeleted: false,
  })
    .select('journeyId')
    .lean();

  if (!journeyPurchases.length) {
    return [];
  }

  const journeyIds = journeyPurchases.map((purchase) => purchase.journeyId);

  return JourneyCapsule.find({
    journeyId: { $in: journeyIds },
    individualCapsuleId: { $exists: true, $ne: null },
    isDeleted: false,
  })
    .select('individualCapsuleId journeyId capsuleNumber')
    .sort({ capsuleNumber: 1 })
    .lean();
};

const hasExpeditionAccessToCapsule = async (
  studentId: string,
  capsuleId: string,
) => {
  const studentObjectId = ensureObjectId(studentId, 'studentId');
  const capsuleObjectId = ensureObjectId(capsuleId, 'capsuleId');

  const journeyLinks = await JourneyCapsule.find({
    individualCapsuleId: capsuleObjectId,
    isDeleted: false,
  })
    .select('journeyId')
    .lean();

  if (!journeyLinks.length) {
    return null;
  }

  const journeyIds = journeyLinks.map((link) => link.journeyId);

  const journeyPurchase = await PurchasedJourney.findOne({
    studentId: studentObjectId,
    journeyId: { $in: journeyIds },
    paymentStatus: TPaymentStatus.completed,
    isDeleted: false,
  })
    .select('journeyId')
    .lean();

  return journeyPurchase?.journeyId?.toString() || null;
};

const getCapsuleAccess = async (studentId: string, capsuleId: string) => {
  const [capsule, purchase, expeditionJourneyId] = await Promise.all([
    IndividualCapsule.findOne({
      _id: ensureObjectId(capsuleId, 'capsuleId'),
      isDeleted: false,
    })
      .populate('capsuleCategoryId', 'title')
      .lean(),
    PurchasedIndividualCapsule.findOne({
      capsuleId: ensureObjectId(capsuleId, 'capsuleId'),
      studentId: ensureObjectId(studentId, 'studentId'),
      paymentStatus: TPaymentStatus.completed,
      isDeleted: false,
    }).lean(),
    hasExpeditionAccessToCapsule(studentId, capsuleId),
  ]);

  if (!capsule) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
  }

  let accessType: CapsuleAccessType = 'suggested';
  if (purchase) {
    accessType = purchase.isGifted ? 'gifted' : 'purchased';
  } else if (expeditionJourneyId) {
    accessType = 'purchased';
  }

  return {
    capsule,
    purchase,
    accessType,
    expeditionJourneyId,
  };
};

const ensureOwnedCapsule = async (studentId: string, capsuleId: string) => {
  const access = await getCapsuleAccess(studentId, capsuleId);

  if (!access.purchase && !access.expeditionJourneyId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'You need to own this capsule to access module or lesson content',
    );
  }

  return access;
};

const ensureModuleTrackers = async (studentId: string, capsuleId: string) => {
  const studentObjectId = ensureObjectId(studentId, 'studentId');
  const capsuleObjectId = ensureObjectId(capsuleId, 'capsuleId');

  const [modules, lessons, existingTrackers, completedLessonStats] = await Promise.all([
    IndividualModule.find({
      capsuleId: capsuleObjectId,
      isDeleted: false,
    })
      .sort({ orderNumber: 1, createdAt: 1 })
      .lean(),
    IndividualLesson.aggregate([
      {
        $lookup: {
          from: 'individualmodules',
          localField: 'moduleId',
          foreignField: '_id',
          as: 'module',
        },
      },
      { $unwind: '$module' },
      {
        $match: {
          'module.capsuleId': capsuleObjectId,
          'module.isDeleted': false,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$moduleId',
          totalLessons: { $sum: 1 },
        },
      },
    ]),
    IndividualModuleProgress.find({
      studentId: studentObjectId,
      capsuleId: capsuleObjectId,
      isDeleted: false,
    }).lean(),
    LessonProgress.aggregate([
      {
        $match: {
          studentId: studentObjectId,
          capsuleId: capsuleObjectId,
          isDeleted: false,
          status: TLessonProgress.completed,
        },
      },
      {
        $group: {
          _id: '$moduleId',
          completedLessonsCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const totalLessonsByModule = new Map(
    lessons.map((item: any) => [item._id.toString(), item.totalLessons]),
  );
  const completedLessonsByModule = new Map(
    completedLessonStats.map((item: any) => [
      item._id.toString(),
      item.completedLessonsCount,
    ]),
  );
  const trackerMap = new Map(
    existingTrackers.map((tracker: any) => [tracker.moduleId.toString(), tracker]),
  );

  let shouldUnlockCurrent = true;
  const bulkOperations: any[] = [];

  for (const module of modules) {
    const key = module._id.toString();
    const tracker = trackerMap.get(key);
    const totalLessons = totalLessonsByModule.get(key) || 0;
    const completedLessonsCount = completedLessonsByModule.get(key) || 0;

    let status = TIndividualModuleProgress.locked;
    if (tracker?.status === TIndividualModuleProgress.completed) {
      status = TIndividualModuleProgress.completed;
    } else if (shouldUnlockCurrent) {
      status =
        tracker?.status === TIndividualModuleProgress.inProgress
          ? TIndividualModuleProgress.inProgress
          : TIndividualModuleProgress.unlocked;
      shouldUnlockCurrent = false;
    }

    bulkOperations.push({
      updateOne: {
        filter: {
          studentId: studentObjectId,
          capsuleId: capsuleObjectId,
          moduleId: module._id,
        },
        update: {
          $set: {
            status,
            totalLessons,
            completedLessonsCount,
            isDeleted: false,
          },
          $setOnInsert: {
            studentId: studentObjectId,
            capsuleId: capsuleObjectId,
            moduleId: module._id,
          },
        },
        upsert: true,
      },
    });
  }

  if (bulkOperations.length > 0) {
    await IndividualModuleProgress.bulkWrite(bulkOperations);
  }

  const trackers = await IndividualModuleProgress.find({
    studentId: studentObjectId,
    capsuleId: capsuleObjectId,
    isDeleted: false,
  }).lean();

  return {
    modules,
    trackerMap: new Map(
      trackers.map((tracker: any) => [tracker.moduleId.toString(), tracker]),
    ),
  };
};

const ensureLessonTrackers = async (
  studentId: string,
  capsuleId: string,
  moduleId: string,
) => {
  const studentObjectId = ensureObjectId(studentId, 'studentId');
  const capsuleObjectId = ensureObjectId(capsuleId, 'capsuleId');
  const moduleObjectId = ensureObjectId(moduleId, 'moduleId');

  const lessons = await IndividualLesson.find({
    moduleId: moduleObjectId,
    isDeleted: false,
  })
    .sort({ orderNumber: 1, createdAt: 1 })
    .lean();

  const existingTrackers = await LessonProgress.find({
    studentId: studentObjectId,
    capsuleId: capsuleObjectId,
    moduleId: moduleObjectId,
    isDeleted: false,
  }).lean();

  const trackerMap = new Map(
    existingTrackers.map((tracker: any) => [tracker.lessonId.toString(), tracker]),
  );

  let shouldUnlockCurrent = true;
  const bulkOperations: any[] = [];

  for (const lesson of lessons) {
    const key = lesson._id.toString();
    const tracker = trackerMap.get(key);

    let status = TLessonProgress.locked;
    if (tracker?.status === TLessonProgress.completed) {
      status = TLessonProgress.completed;
    } else if (shouldUnlockCurrent) {
      status =
        tracker?.status === TLessonProgress.inProgress
          ? TLessonProgress.inProgress
          : TLessonProgress.unlocked;
      shouldUnlockCurrent = false;
    }

    bulkOperations.push({
      updateOne: {
        filter: {
          studentId: studentObjectId,
          capsuleId: capsuleObjectId,
          moduleId: moduleObjectId,
          lessonId: lesson._id,
        },
        update: {
          $set: {
            status,
            isDeleted: false,
          },
          $setOnInsert: {
            studentId: studentObjectId,
            capsuleId: capsuleObjectId,
            moduleId: moduleObjectId,
            lessonId: lesson._id,
            lastWatchTime: 0,
            isCompleted: false,
          },
        },
        upsert: true,
      },
    });
  }

  if (bulkOperations.length > 0) {
    await LessonProgress.bulkWrite(bulkOperations);
  }

  const trackers = await LessonProgress.find({
    studentId: studentObjectId,
    capsuleId: capsuleObjectId,
    moduleId: moduleObjectId,
    isDeleted: false,
  }).lean();

  return {
    lessons,
    trackerMap: new Map(
      trackers.map((tracker: any) => [tracker.lessonId.toString(), tracker]),
    ),
  };
};

const getMyCapsules = async (
  studentId: string,
  type: 'purchased' | 'gifted' | 'suggested' | 'all' = 'all',
  page: number = 1,
  limit: number = 10,
) => {
  const studentObjectId = ensureObjectId(studentId, 'studentId');

  const ownedPurchases = await PurchasedIndividualCapsule.find({
    studentId: studentObjectId,
    paymentStatus: TPaymentStatus.completed,
    isDeleted: false,
  })
    .populate('capsuleId', 'title level description thumbnail price numberOfModules averageRating totalReviewCount capsuleCategoryId')
    .populate({
      path: 'capsuleId',
      populate: {
        path: 'capsuleCategoryId',
        select: 'title sellIndividually',
      },
    })
    .sort({ updatedAt: -1 })
    .lean();

  const expeditionLinks = await getExpeditionCapsuleLinks(studentId);
  const expeditionCapsuleIds = expeditionLinks
    .map((link) => link.individualCapsuleId)
    .filter(Boolean);

  const expeditionCapsules = expeditionCapsuleIds.length
    ? await IndividualCapsule.find({
        _id: { $in: expeditionCapsuleIds },
        isDeleted: false,
      })
        .populate('capsuleCategoryId', 'title sellIndividually')
        .lean()
    : [];

  const expeditionCapsuleMap = new Map(
    expeditionCapsules.map((capsule: any) => [capsule._id.toString(), capsule]),
  );

  const expeditionJourneyByCapsule = new Map(
    expeditionLinks.map((link) => [
      link.individualCapsuleId?.toString(),
      link.journeyId?.toString(),
    ]),
  );

  const ownedCapsuleIds = new Set<string>([
    ...ownedPurchases
      .map((purchase: any) => purchase.capsuleId?._id?.toString())
      .filter(Boolean),
    ...expeditionCapsuleIds.map((id) => id!.toString()),
  ]);

  const purchasedResults = [
    ...ownedPurchases
      .filter((purchase: any) => !purchase.isGifted && purchase.capsuleId)
      .map((purchase: any) =>
        formatCapsuleCard(purchase.capsuleId, 'purchased', purchase, {
          purchaseSource: 'individual',
        }),
      ),
    ...expeditionCapsuleIds
      .map((capsuleId) => {
        const id = capsuleId!.toString();
        const capsule = expeditionCapsuleMap.get(id);
        if (!capsule) return null;

        const alreadyListed = ownedPurchases.some(
          (purchase: any) =>
            !purchase.isGifted &&
            purchase.capsuleId?._id?.toString() === id,
        );
        if (alreadyListed) return null;

        return formatCapsuleCard(capsule, 'purchased', null, {
          purchaseSource: 'expedition',
          journeyId: expeditionJourneyByCapsule.get(id) || null,
        });
      })
      .filter(Boolean),
  ];

  const giftedResults = ownedPurchases
    .filter((purchase: any) => purchase.isGifted && purchase.capsuleId)
    .map((purchase: any) =>
      formatCapsuleCard(purchase.capsuleId, 'gifted', purchase, {
        purchaseSource: 'individual',
      }),
    );

  const suggestedCapsules = await IndividualCapsule.find({
    isDeleted: false,
    ...(ownedCapsuleIds.size > 0
      ? { _id: { $nin: Array.from(ownedCapsuleIds) } }
      : {}),
  })
    .populate('capsuleCategoryId', 'title sellIndividually')
    .sort({ averageRating: -1, createdAt: -1 })
    .lean();

  const profileText = await collectStudentProfileText(studentId);
  const weightedThemes = scoreThemesWithWeights(profileText);
  const journeyLinkedIds = await getJourneyLinkedIndividualCapsuleIds();

  const suggestedResults = suggestedCapsules
    .filter((capsule: any) => {
      if (journeyLinkedIds.has(String(capsule._id))) return false;
      const category = capsule.capsuleCategoryId as any;
      if (!category?.title) return false;
      return !isJourneyOnlyDiscoverCategory(category);
    })
    .map((capsule: any) => ({
      card: formatCapsuleCard(capsule, 'suggested'),
      score: scoreContentAgainstThemes(capsule.title, '', weightedThemes),
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.card);

  let selectedResults = suggestedResults;
  if (type === 'purchased') {
    selectedResults = purchasedResults as any[];
  } else if (type === 'gifted') {
    selectedResults = giftedResults;
  } else if (type === 'all') {
    selectedResults = [
      ...purchasedResults,
      ...giftedResults,
      ...suggestedResults,
    ] as any[];
  }

  const total = selectedResults.length;
  const paginatedResults = selectedResults.slice((page - 1) * limit, page * limit);

  return {
    ...paginateResults(paginatedResults, total, page, limit),
    counts: {
      purchased: purchasedResults.length,
      gifted: giftedResults.length,
      suggested: suggestedResults.length,
      all: purchasedResults.length + giftedResults.length + suggestedResults.length,
    },
    selectedType: type,
  };
};

const getCapsuleDetails = async (studentId: string, capsuleId: string) => {
  const { capsule, purchase, accessType } = await getCapsuleAccess(studentId, capsuleId);

  let moduleSummaries: any[] = [];

  if (accessType === 'suggested') {
    const modules = await IndividualModule.find({
      capsuleId: ensureObjectId(capsuleId, 'capsuleId'),
      isDeleted: false,
    })
      .sort({ orderNumber: 1, createdAt: 1 })
      .lean();

    moduleSummaries = modules.map(module => ({
      moduleId: module._id,
      title: module.title,
      estimatedTime: module.estimatedTime,
      orderNumber: module.orderNumber,
      numberOfLessons: module.numberOfLessons,
      status: TIndividualModuleProgress.locked,
      isLocked: true,
      completedLessonsCount: 0,
      totalLessons: module.numberOfLessons,
    }));
  } else {
    const { modules, trackerMap } = await ensureModuleTrackers(studentId, capsuleId);

    moduleSummaries = modules.map(module => {
      const tracker = trackerMap.get(module._id.toString());
      const status = tracker?.status || TIndividualModuleProgress.locked;

      return {
        moduleId: module._id,
        title: module.title,
        estimatedTime: module.estimatedTime,
        orderNumber: module.orderNumber,
        numberOfLessons: module.numberOfLessons,
        status,
        isLocked: status === TIndividualModuleProgress.locked,
        completedLessonsCount: tracker?.completedLessonsCount || 0,
        totalLessons: tracker?.totalLessons ?? module.numberOfLessons ?? 0,
      };
    });
  }

  return {
    capsule: {
      capsuleId: capsule._id,
      title: capsule.title,
      level: capsule.level,
      description: capsule.description,
      about: capsule.about,
      whatYouLearn: capsule.whatYouLearn || [],
      thumbnail: capsule.thumbnail || '',
      price: capsule.price,
      numberOfModules: capsule.numberOfModules,
      averageRating: capsule.averageRating || 0,
      totalReviewCount: capsule.totalReviewCount || 0,
      category: (capsule.capsuleCategoryId as any)?.title || '',
      categoryId:
        (capsule.capsuleCategoryId as any)?._id ||
        capsule.capsuleCategoryId ||
        null,
    },
    accessType,
    canAccessContent: accessType !== 'suggested',
    purchase: purchase
      ? {
          status: purchase.status,
          progressPercent: purchase.progressPercent || 0,
          completedModules: purchase.completedModules || 0,
          totalModules: purchase.totalModules || capsule.numberOfModules || 0,
          completedLessons: purchase.completedLessons || 0,
          totalLessons: purchase.totalLessons || 0,
          isGifted: purchase.isGifted,
        }
      : null,
    modules: moduleSummaries,
  };
};

const getModuleLessons = async (studentId: string, capsuleId: string, moduleId: string) => {
  await ensureOwnedCapsule(studentId, capsuleId);

  const { modules, trackerMap } = await ensureModuleTrackers(studentId, capsuleId);
  const module = modules.find(item => item._id.toString() === moduleId);

  if (!module) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Module not found in this capsule');
  }

  const moduleTracker = trackerMap.get(moduleId);
  const moduleStatus = moduleTracker?.status || TIndividualModuleProgress.locked;
  if (moduleStatus === TIndividualModuleProgress.locked) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Please complete the previous module to unlock this module',
    );
  }

  const { lessons, trackerMap: lessonTrackerMap } = await ensureLessonTrackers(
    studentId,
    capsuleId,
    moduleId,
  );

  return {
    module: {
      moduleId: module._id,
      title: module.title,
      estimatedTime: module.estimatedTime,
      orderNumber: module.orderNumber,
      thumbnail: module.thumbnail || '',
      status: moduleStatus,
      isLocked: false,
      completedLessonsCount: moduleTracker?.completedLessonsCount || 0,
      totalLessons: moduleTracker?.totalLessons ?? module.numberOfLessons ?? lessons.length,
    },
    lessons: lessons.map(lesson => {
      const tracker = lessonTrackerMap.get(lesson._id.toString());
      const status = tracker?.status || TLessonProgress.locked;

      return {
        lessonId: lesson._id,
        title: lesson.title,
        estimatedTime: lesson.estimatedTime,
        orderNumber: lesson.orderNumber,
        status,
        isLocked: status === TLessonProgress.locked,
        isCompleted: tracker?.isCompleted || false,
        lastWatchTime: tracker?.lastWatchTime || 0,
      };
    }),
  };
};

const getLessonContent = async (
  studentId: string,
  capsuleId: string,
  moduleId: string,
  lessonId: string,
) => {
  await ensureOwnedCapsule(studentId, capsuleId);

  const modulePayload = await getModuleLessons(studentId, capsuleId, moduleId);
  const selectedLesson = modulePayload.lessons.find(
    lesson => lesson.lessonId.toString() === lessonId,
  );

  if (!selectedLesson) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found in this module');
  }

  if (selectedLesson.isLocked) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Please complete the previous lesson to unlock this lesson',
    );
  }

  const lesson = await IndividualLesson.findOne({
    _id: ensureObjectId(lessonId, 'lessonId'),
    moduleId: ensureObjectId(moduleId, 'moduleId'),
    isDeleted: false,
  }).lean();

  if (!lesson) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Lesson not found');
  }

  return {
    module: modulePayload.module,
    lesson: {
      lessonId: lesson._id,
      title: lesson.title,
      estimatedTime: lesson.estimatedTime,
      orderNumber: lesson.orderNumber,
      lessonVideo: lesson.lessonVideo || null,
      status: selectedLesson.status,
      isCompleted: selectedLesson.isCompleted,
      lastWatchTime: selectedLesson.lastWatchTime,
    },
  };
};

const buildSectionsFromAnswers = async (
  studentId: string,
): Promise<{
  sections: QuestionnaireSummarySection[];
  questionsAndAnswers: Array<{ question: string; answer: string }>;
  lastQuestionaryId: mongoose.Types.ObjectId | null;
  template: ReturnType<typeof buildTemplateQuestionnaireSummary>;
}> => {
  const questionaries = await Questionary.find({
    category: TQuestionaryCategory.free,
    isDeleted: false,
  })
    .sort({ createdAt: 1 })
    .lean();

  const questionsByQuestionary = new Map<string, any[]>();
  const answersByQuestionary = new Map<string, any[]>();
  const questionsAndAnswers: Array<{ question: string; answer: string }> = [];

  for (const questionary of questionaries) {
    const qId = questionary._id!.toString();
    const questions = await Question.find({
      questionaryId: questionary._id,
      isDeleted: false,
    })
      .sort({ sl: 1 })
      .lean();
    questionsByQuestionary.set(qId, questions);

    const answers = await StudentAnswer.find({
      studentId: ensureObjectId(studentId, 'studentId'),
      questionaryId: questionary._id,
      isDeleted: false,
    }).lean();
    answersByQuestionary.set(qId, answers);

    const answerMap = new Map(answers.map(a => [a.questionId.toString(), a]));
    for (const question of questions) {
      const saved = answerMap.get(question._id!.toString());
      if (!saved) continue;
      const answerText = formatAnswerValue(saved.answer, question as any);
      if (!answerText) continue;
      questionsAndAnswers.push({
        question: question.title,
        answer: answerText,
      });
    }
  }

  const template = buildTemplateQuestionnaireSummary({
    questionaries,
    questionsByQuestionary,
    answersByQuestionary,
  });

  const lastQuestionary = questionaries[questionaries.length - 1];

  return {
    sections: template.sections,
    questionsAndAnswers,
    lastQuestionaryId: lastQuestionary?._id
      ? new mongoose.Types.ObjectId(String(lastQuestionary._id))
      : null,
    template,
  };
};

const getOrGenerateQuestionnaireSummary = async (
  studentId: string,
  options?: { force?: boolean },
) => {
  const existing = await StudentQuestionnaireSummary.findOne({
    studentId: ensureObjectId(studentId, 'studentId'),
    isDeleted: false,
  }).lean();

  const { sections, questionsAndAnswers, lastQuestionaryId, template } =
    await buildSectionsFromAnswers(studentId);

  if (questionsAndAnswers.length === 0) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Complete the onboarding questionnaire before viewing your summary',
    );
  }

  const looksGenericOrStale = (summaryText?: string, texts?: string[]) => {
    const blob = `${summaryText || ''} ${(texts || []).join(' ')}`;
    return (
      !summaryText ||
      /Chercheur de Clarté|Votre parcours reflète|learning needs|Complète le questionnaire|Ces éléments guideront vos/i.test(
        blob,
      ) ||
      // Old English template leftovers
      /Based on the following|student's learning/i.test(blob)
    );
  };

  // Keep stored summary only if it already looks personalized AND OpenAI is off
  // (or caller did not force refresh). When OpenAI is configured we always regenerate
  // so the client sees the AI analysis from the prompt — not a cached generic text.
  const { isOpenAiConfigured } = await import('../../../config/openai');
  const openAiReady = isOpenAiConfigured();

  if (
    !options?.force &&
    !openAiReady &&
    existing?.title &&
    existing.texts?.length &&
    existing.summary &&
    !looksGenericOrStale(existing.summary, existing.texts)
  ) {
    return {
      title: existing.title,
      texts: existing.texts,
      summary: existing.summary,
      sections: existing.sections?.length ? existing.sections : sections,
      source: 'stored' as const,
    };
  }

  const learnerFirstName = await resolveLearnerFirstName(studentId);

  const generated = await AIService.generateSummary(
    'La Propulserie — Onboarding',
    questionsAndAnswers,
    template,
    learnerFirstName,
  );

  // Marii's structured analysis replaces the raw question/answer recap when available
  const responseSections =
    generated.source === 'ai' && generated.sections?.length ? generated.sections : sections;

  if (lastQuestionaryId) {
    await StudentQuestionnaireSummary.findOneAndUpdate(
      {
        studentId: ensureObjectId(studentId, 'studentId'),
        isDeleted: false,
      },
      {
        studentId: ensureObjectId(studentId, 'studentId'),
        questionaryId: lastQuestionaryId,
        title: generated.title,
        texts: generated.texts,
        summary: generated.summary,
        sections: responseSections,
      },
      { upsert: true, new: true },
    );

    generateAndStoreMentorRecommendations(studentId).catch(err =>
      console.error('[Questionnaire] Mentor recommendations failed:', err),
    );
  }

  return {
    title: generated.title,
    texts: generated.texts,
    summary: generated.summary,
    sections: responseSections,
    firstName: learnerFirstName,
    source: generated.source,
  };
};

export const StudentDashboardService = {
  generateAndStoreMentorRecommendations,
  getOrGenerateQuestionnaireSummary,
  getPersonalizedRecommendations,
  getTopMentors,
  getCapsuleCategories,
  getCapsules,
  getStudentProgress,
  getMyMentors,
  getCompletedJourneys,
  getMyCapsules,
  getCapsuleDetails,
  getModuleLessons,
  getLessonContent,
};
