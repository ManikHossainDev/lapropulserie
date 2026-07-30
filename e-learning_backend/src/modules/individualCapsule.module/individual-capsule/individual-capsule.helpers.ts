import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { IndividualCapsuleCategory } from '../individual-capsule-category/individual-capsule-category.model';
import { IIndividualCapsuleCategory } from '../individual-capsule-category/individual-capsule-category.interface';
import { IIndividualCapsule } from './individual-capsule.interface';

export async function applyCategoryCommercialDefaults(
  data: IIndividualCapsule,
): Promise<{ data: IIndividualCapsule; category: IIndividualCapsuleCategory }> {
  const category = await IndividualCapsuleCategory.findOne({
    _id: data.capsuleCategoryId,
    isDeleted: false,
  });

  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Capsule category not found');
  }

  data.level = data.level ?? category.level;
  data.description = data.description ?? category.description;
  data.about = data.about ?? category.about;
  data.numberOfModules = data.numberOfModules ?? category.estimatedDuration ?? 0;
  data.price = data.price ?? category.price;
  data.whatYouLearn =
    data.whatYouLearn && data.whatYouLearn.length > 0
      ? data.whatYouLearn
      : category.whatYouLearn ?? [];
  data.thumbnail = data.thumbnail ?? category.thumbnail;
  data.capsuleType = data.capsuleType ?? category.capsuleType ?? 'regular';
  data.priceId = data.priceId ?? category.priceId;

  return { data, category };
}
