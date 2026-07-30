import mongoose from 'mongoose';
import { JourneyCapsule } from './journey-capsule.model';
import { IndividualCapsule } from '../../individualCapsule.module/individual-capsule/individual-capsule.model';

/**
 * A JourneyCapsule keeps a denormalized copy of its linked IndividualCapsule
 * (title, description, thumbnail). Editing the individual capsule used to leave
 * that copy stale, so journeys displayed outdated names such as a category label
 * instead of the real capsule title (client feedback #35/#36).
 */
export const syncJourneyCapsulesFromIndividualCapsule = async (
  individualCapsuleId: mongoose.Types.ObjectId | string,
): Promise<number> => {
  const capsule = await IndividualCapsule.findById(individualCapsuleId)
    .select('title description about thumbnail')
    .lean();

  if (!capsule) return 0;

  const result = await JourneyCapsule.updateMany(
    { individualCapsuleId: new mongoose.Types.ObjectId(String(individualCapsuleId)) },
    {
      $set: {
        title: capsule.title,
        description: capsule.description || capsule.about || '',
        roadMapBrief: capsule.description?.slice(0, 120) || capsule.title,
        ...(capsule.thumbnail ? { thumbnail: capsule.thumbnail } : {}),
      },
    },
  );

  return result.modifiedCount ?? 0;
};

/** Resync every journey capsule that is linked to an individual capsule. */
export const syncAllLinkedJourneyCapsules = async (): Promise<number> => {
  const linked = await JourneyCapsule.find({
    individualCapsuleId: { $exists: true, $ne: null },
    isDeleted: false,
  })
    .select('individualCapsuleId')
    .lean();

  const uniqueIds = [...new Set(linked.map((row) => String(row.individualCapsuleId)))];

  let total = 0;
  for (const id of uniqueIds) {
    total += await syncJourneyCapsulesFromIndividualCapsule(id);
  }
  return total;
};
