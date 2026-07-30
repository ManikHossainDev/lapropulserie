import { IIndividualCapsuleCategory } from './individual-capsule-category.interface';

export function normalizeCategoryPricing(
  data: IIndividualCapsuleCategory,
): IIndividualCapsuleCategory {
  if (data.sellIndividually === false) {
    return {
      ...data,
      price: 0,
      sellIndividually: false,
      priceId: undefined,
    };
  }

  return {
    ...data,
    sellIndividually: true,
    price: Number(data.price) || 0,
  };
}
