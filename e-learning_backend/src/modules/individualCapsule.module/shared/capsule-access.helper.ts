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

  if (capsule.capsuleType === 'free') {
    return;
  }

  const category = capsule.capsuleCategoryId
    ? await IndividualCapsuleCategory.findOne({
        _id: capsule.capsuleCategoryId,
        isDeleted: false,
      })
        .select('sellIndividually price capsuleType')
        .lean()
    : null;

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

      // Completed payment, or a started checkout (pending) for this journey
      const journeyPurchase = await PurchasedJourney.findOne({
        studentId: studentObjectId,
        journeyId: journeyObjectId,
        isDeleted: false,
        paymentStatus: { $in: ['completed', 'pending'] },
      }).lean();
      if (journeyPurchase) return;
    }
  }

  const journeyLinks = await JourneyCapsule.find({
    individualCapsuleId: capsuleObjectId,
    isDeleted: false,
  })
    .select('journeyId')
    .lean();

  if (journeyLinks.length) {
    const journeyIds = journeyLinks.map(link => link.journeyId);

    const journeyPurchase = await PurchasedJourney.findOne({
      studentId: studentObjectId,
      journeyId: { $in: journeyIds },
      isDeleted: false,
      paymentStatus: { $in: ['completed', 'pending'] },
    }).lean();
    if (journeyPurchase) return;

    // Free expeditions: journeyType "free" OR price 0 (price alone was missing free gifts)
    const freeJourneys = await Journey.find({
      _id: { $in: journeyIds },
      isDeleted: false,
      $or: [{ journeyType: 'free' }, { price: 0 }, { price: { $exists: false } }],
    })
      .select('_id')
      .lean();

    if (freeJourneys.length) {
      const freeClaim = await PurchasedJourney.findOne({
        studentId: studentObjectId,
        journeyId: { $in: freeJourneys.map(j => j._id) },
        isDeleted: false,
      }).lean();
      if (freeClaim) return;

      // Authenticated learner opening a free-journey capsule: allow without prior claim
      return;
    }
  }

  if (category?.sellIndividually === false) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'This capsule is only available through an Expedition Journey purchase',
    );
  }

  if (capsule.price === 0 && category?.capsuleType === 'free') {
    return;
  }

  const individualPurchase = await PurchasedIndividualCapsule.findOne({
    studentId: studentObjectId,
    capsuleId: capsuleObjectId,
    isDeleted: false,
    paymentStatus: 'completed',
  }).lean();

  if (individualPurchase) return;

  throw new ApiError(
    StatusCodes.FORBIDDEN,
    'You need to purchase this capsule or expedition before continuing',
  );
}
