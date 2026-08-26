import mongoose from 'mongoose';
import { IndividualCapsule } from '../../individualCapsule.module/individual-capsule/individual-capsule.model';
import { IndividualCapsuleCategory } from '../../individualCapsule.module/individual-capsule-category/individual-capsule-category.model';
import { Journey } from '../../journey.module/journey/journey.model';
import { PurchasedIndividualCapsule } from '../../individualCapsule.module/purchased-individual-capsule/purchased-individual-capsule.model';
import { PurchasedJourney } from '../../journey.module/purchased-journey/purchased-journey.model';
import { MariiReport } from '../../individualCapsule.module/marii-report/marii-report.model';
import { JourneyMariiReport } from '../../individualCapsule.module/marii-report/journey-marii-report.model';
import {
  IWeightedTheme,
  scoreThemesWithWeights,
} from '../../individualCapsule.module/marii-report/marii-report.utils';
import { StudentQuestionnaireSummary } from './student-questionnaire-summary.model';
import {
  getJourneyLinkedIndividualCapsuleIds,
  isJourneyOnlyDiscoverCategory,
} from '../../individualCapsule.module/shared/capsule-access.helper';

export type RecommendationContext =
  | 'questionnaire'
  | 'capsule_complete'
  | 'journey_complete'
  | 'discover';

const CONTEXT_MESSAGES: Record<RecommendationContext, string> = {
  questionnaire:
    'Basé sur votre questionnaire, voici des parcours qui pourraient vous correspondre.',
  capsule_complete: 'Pour poursuivre votre exploration après cette capsule :',
  journey_complete: 'Après cette expédition, poursuivez votre parcours avec :',
  discover: 'Suggestions personnalisées pour vous :',
};

export const scoreContentAgainstThemes = (
  title: string,
  description: string,
  weightedThemes: IWeightedTheme[],
): number => {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;

  for (const weighted of weightedThemes) {
    for (const keyword of weighted.theme.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += weighted.share * 3;
      }
    }
    if (text.includes(weighted.theme.theme.toLowerCase().slice(0, 12))) {
      score += weighted.share * 4;
    }
    for (const capsuleName of weighted.theme.capsules) {
      const fragment = capsuleName.toLowerCase().slice(0, 14);
      if (fragment.length > 4 && text.includes(fragment)) {
        score += weighted.share * 5;
      }
    }
  }

  return score;
};

export const collectStudentProfileText = async (
  studentId: string,
  capsuleId?: string,
  journeyId?: string,
): Promise<string> => {
  const studentOid = new mongoose.Types.ObjectId(studentId);
  const parts: string[] = [];

  const summary = await StudentQuestionnaireSummary.findOne({
    studentId: studentOid,
    isDeleted: false,
  }).lean();

  if (summary) {
    parts.push(summary.title, summary.summary, ...(summary.texts || []));
  }

  const reports = await MariiReport.find({
    studentId: studentOid,
    isDeleted: false,
  }).lean();

  for (const report of reports) {
    if (report.report?.mainTheme) parts.push(report.report.mainTheme);
    if (report.report?.secondaryThemes?.length) {
      parts.push(...report.report.secondaryThemes);
    }
    if (report.report?.observations) parts.push(report.report.observations);
  }

  if (capsuleId) {
    const focused = reports.find(
      r => r.capsuleId?.toString() === capsuleId,
    );
    if (focused?.report?.mainTheme) {
      parts.push(focused.report.mainTheme, ...focused.report.secondaryThemes);
    }
  }

  if (journeyId) {
    const journeyReport = await JourneyMariiReport.findOne({
      studentId: studentOid,
      journeyId: new mongoose.Types.ObjectId(journeyId),
      isDeleted: false,
    }).lean();

    if (journeyReport?.report?.mainTheme) {
      parts.push(
        journeyReport.report.mainTheme,
        ...(journeyReport.report.secondaryThemes || []),
      );
    }
  }

  return parts.join(' ').toLowerCase();
};

export const getPersonalizedRecommendations = async (
  studentId: string,
  context: RecommendationContext,
  options?: { capsuleId?: string; journeyId?: string },
) => {
  const studentOid = new mongoose.Types.ObjectId(studentId);
  const profileText = await collectStudentProfileText(
    studentId,
    options?.capsuleId,
    options?.journeyId,
  );
  const weightedThemes = scoreThemesWithWeights(profileText);
  const primaryTheme = weightedThemes[0]?.theme.theme || 'Exploration';

  const purchases = await PurchasedIndividualCapsule.find({
    studentId: studentOid,
    isDeleted: false,
  })
    .select('capsuleId')
    .lean();

  const ownedCapsuleIds = new Set(
    purchases.map(p => p.capsuleId?.toString()).filter(Boolean) as string[],
  );

  const journeyPurchases = await PurchasedJourney.find({
    studentId: studentOid,
    isDeleted: false,
  })
    .select('journeyId')
    .lean();

  const ownedJourneyIds = new Set(
    journeyPurchases.map(p => p.journeyId?.toString()).filter(Boolean) as string[],
  );

  const categories = await IndividualCapsuleCategory.find({
    isDeleted: false,
  }).lean();

  const scoredCategories = categories
    .filter((cat: any) => !isJourneyOnlyDiscoverCategory(cat))
    .map((cat: any) => ({
      id: cat._id,
      title: cat.title,
      description: cat.description,
      thumbnail: cat.thumbnail,
      price: cat.price,
      score: scoreContentAgainstThemes(
        cat.title,
        `${cat.description || ''} ${cat.about || ''}`,
        weightedThemes,
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const capsules = await IndividualCapsule.find({
    isDeleted: false,
    ...(ownedCapsuleIds.size > 0
      ? { _id: { $nin: Array.from(ownedCapsuleIds) } }
      : {}),
  })
    .populate('capsuleCategoryId', 'title sellIndividually')
    .lean();

  const journeyLinkedIds = await getJourneyLinkedIndividualCapsuleIds();

  const scoredCapsulesRaw = capsules
    .filter((c: any) => {
      if (journeyLinkedIds.has(String(c._id))) return false;
      const category = c.capsuleCategoryId as any;
      if (!category?.title) return false;
      return !isJourneyOnlyDiscoverCategory(category);
    })
    .map((c: any) => {
      const category = c.capsuleCategoryId as any;
      const categoryId = category?._id || category?.id || c.capsuleCategoryId;
      return {
        id: c._id,
        title: c.title,
        thumbnail: c.thumbnail,
        categoryId,
        categoryTitle: category?.title,
        score: scoreContentAgainstThemes(
          c.title,
          `${category?.title || ''} ${c.description || ''}`,
          weightedThemes,
        ),
      };
    })
    .sort((a, b) => b.score - a.score);

  // Prefer category diversity so suggestions are not all from one theme
  const scoredCapsules: typeof scoredCapsulesRaw = [];
  const usedCategories = new Set<string>();
  for (const cap of scoredCapsulesRaw) {
    if (scoredCapsules.length >= 4) break;
    const key = String(cap.categoryId || '');
    if (key && usedCategories.has(key)) continue;
    if (key) usedCategories.add(key);
    scoredCapsules.push(cap);
  }
  for (const cap of scoredCapsulesRaw) {
    if (scoredCapsules.length >= 4) break;
    if (scoredCapsules.some(s => String(s.id) === String(cap.id))) continue;
    scoredCapsules.push(cap);
  }

  const journeys = await Journey.find({
    isDeleted: false,
    isActive: { $ne: false },
  }).lean();

  const scoredJourneys = journeys
    .filter(j => !ownedJourneyIds.has(j._id!.toString()))
    .map(j => ({
      id: j._id,
      title: j.title,
      description: j.description || j.roadMapBrief,
      thumbnail: j.thumbnail,
      price: j.price,
      score: scoreContentAgainstThemes(
        j.title,
        `${j.description || ''} ${j.roadMapBrief || ''}`,
        weightedThemes,
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  return {
    context,
    message: CONTEXT_MESSAGES[context],
    primaryTheme,
    categories: scoredCategories,
    capsules: scoredCapsules,
    journeys: scoredJourneys,
  };
};
