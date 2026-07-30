import mongoose from 'mongoose';

export const normalizeOptionalObjectId = (value: unknown) => {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

export const isValidOptionalObjectIdString = (value?: string) => {
  const normalizedValue = normalizeOptionalObjectId(value);
  return (
    normalizedValue === undefined ||
    mongoose.Types.ObjectId.isValid(String(normalizedValue))
  );
};
