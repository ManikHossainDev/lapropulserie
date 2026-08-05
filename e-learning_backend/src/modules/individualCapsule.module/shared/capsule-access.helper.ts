import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { PurchasedIndividualCapsule } from '../purchased-individual-capsule/purchased-individual-capsule.model';
import { IndividualCapsule } from '../individual-capsule/individual-capsule.model';
import { IndividualCapsuleCategory } from '../individual-capsule-category/individual-capsule-category.model';
import { JourneyCapsule } from '../../journey.module/journey-capsule/journey-capsule.model';
import { PurchasedJourney } from '../../journey.module/purchased-journey/purchased-journey.model';
import { Journey } from '../../journey.module/journey/journey.model';

const isFreeJourneyDoc = (journey?: { journeyType?: string; price?: number } | null) => {
  if (!journey) return false;
  if (journey.journeyType === 'free') return true;
  return journey.price === 0 || journey.price == null;
};

/** Effective commercial price: capsule field first, then category. */
const resolveEffectivePrice = (
  capsule: { price?: number | null },
  category?: { price?: number | null } | null,
) => {
  const raw =
    capsule.price != null && capsule.price !== undefined
      ? capsule.price
      : category?.price;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Gate learner access to individual-capsule content (#50 paywall).
 *
 * Free: effective price <= 0.
 * Paid Discover: requires completed individual purchase (or gifted).
 * Expedition: requires matching journeyId + free journey OR completed journey purchase.
 * Capsules linked to a free expedition must NOT unlock Discover-only access without journey context.
 */
export async function assertStudentCapsuleAccess(
  studentId: string,
  capsuleId: string,
  options?: { journeyId?: string },
) {
  const studentObjectId = new mongoose.Types.ObjectId(studentId);
  const capsuleObjectId = new mongoose.Types.ObjectId(capsuleId);

  const capsule = await IndividualCapsule.findOne({
    _id: capsuleObjectId,
    isDeleted: false,
  })
    .select('capsuleType price capsuleCategoryId')
    .lean();

  if (!capsule) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule not found');
  }

  const category = capsule.capsuleCategoryId
    ? await IndividualCapsuleCategory.findOne({
        _id: capsule.capsuleCategoryId,
        isDeleted: false,
      })
        .select('sellIndividually price capsuleType')
        .lean()
    : null;

  const effectivePrice = resolveEffectivePrice(capsule, category);

  // Explicit journey from the student URL — strongest signal.
  if (options?.journeyId && mongoose.isValidObjectId(options.journeyId)) {
    const journeyObjectId = new mongoose.Types.ObjectId(options.journeyId);
    const journey = await Journey.findOne({
      _id: journeyObjectId,
      isDeleted: false,
    })
      .select('journeyType price')
      .lean();

    const linkedToJourney = await JourneyCapsule.findOne({
      journeyId: journeyObjectId,
      individualCapsuleId: capsuleObjectId,
      isDeleted: false,
    })
      .select('_id')
      .lean();

    if (journey && linkedToJourney) {
      if (isFreeJourneyDoc(journey)) {
        return;
      }

      const journeyPurchase = await PurchasedJourney.findOne({
        studentId: studentObjectId,
        journeyId: journeyObjectId,
        isDeleted: false,
        paymentStatus: 'completed',
      }).lean();
      if (journeyPurchase) return;

      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'You need to purchase this expedition before continuing',
      );
    }
  }

  // Free individual capsules (no price) — still block journey-only catalogue items without journey context.
  if (effectivePrice <= 0) {
    if (category?.sellIndividually === false) {
      const linkedFreeUnlock = await hasCompletedOrFreeJourneyAccess(
        studentObjectId,
        capsuleObjectId,
      );
      if (linkedFreeUnlock) return;
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        'This capsule is only available through an Expedition Journey',
      );
    }
    return;
  }

  // Paid individual purchase
  const individualPurchase = await PurchasedIndividualCapsule.findOne({
    studentId: studentObjectId,
    capsuleId: capsuleObjectId,
    isDeleted: false,
    paymentStatus: 'completed',
  }).lean();
  if (individualPurchase) return;

  // Paid capsule unlocked via a completed paid expedition that includes it
  const expeditionUnlock = await hasCompletedPaidJourneyAccess(
    studentObjectId,
    capsuleObjectId,
  );
  if (expeditionUnlock) return;

  if (category?.sellIndividually === false) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'This capsule is only available through an Expedition Journey purchase',
    );
  }

  throw new ApiError(
    StatusCodes.FORBIDDEN,
    'You need to purchase this capsule or expedition before continuing',
  );
}

async function hasCompletedPaidJourneyAccess(
  studentObjectId: mongoose.Types.ObjectId,
  capsuleObjectId: mongoose.Types.ObjectId,
) {
  const journeyLinks = await JourneyCapsule.find({
    individualCapsuleId: capsuleObjectId,
    isDeleted: false,
  })
    .select('journeyId')
    .lean();

  if (!journeyLinks.length) return false;

  const journeyIds = journeyLinks.map(link => link.journeyId);

  const journeyPurchase = await PurchasedJourney.findOne({
    studentId: studentObjectId,
    journeyId: { $in: journeyIds },
    isDeleted: false,
    paymentStatus: 'completed',
  }).lean();

  return Boolean(journeyPurchase);
}

async function hasCompletedOrFreeJourneyAccess(
  studentObjectId: mongoose.Types.ObjectId,
  capsuleObjectId: mongoose.Types.ObjectId,
) {
  const journeyLinks = await JourneyCapsule.find({
    individualCapsuleId: capsuleObjectId,
    isDeleted: false,
  })
    .select('journeyId')
    .lean();

  if (!journeyLinks.length) return false;

  const journeyIds = journeyLinks.map(link => link.journeyId);

  const completedPurchase = await PurchasedJourney.findOne({
    studentId: studentObjectId,
    journeyId: { $in: journeyIds },
    isDeleted: false,
    paymentStatus: 'completed',
  }).lean();
  if (completedPurchase) return true;

  // Claimed free expedition (gift claim row may exist without "completed" payment semantics)
  const freeJourneys = await Journey.find({
    _id: { $in: journeyIds },
    isDeleted: false,
    $or: [{ journeyType: 'free' }, { price: 0 }, { price: { $exists: false } }],
  })
    .select('_id')
    .lean();

  if (!freeJourneys.length) return false;

  const freeClaim = await PurchasedJourney.findOne({
    studentId: studentObjectId,
    journeyId: { $in: freeJourneys.map(j => j._id) },
    isDeleted: false,
  }).lean();

  return Boolean(freeClaim);
}
