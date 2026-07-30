export function buildCategoryPayload({
  title,
  description,
  about,
  level,
  estimatedDuration,
  price,
  whatYouLearn,
}) {
  const isEmpty = price === '' || price === null || price === undefined;
  const numericPrice = isEmpty ? 0 : Number(price);

  return {
    title: title.trim(),
    description: description.trim(),
    about: about.trim(),
    level,
    estimatedDuration: Number(estimatedDuration) || 0,
    price: numericPrice,
    sellIndividually: !isEmpty,
    whatYouLearn: whatYouLearn.filter((item) => item.trim() !== ''),
  };
}

export function appendCategoryFiles(formData, { thumbnailFile }) {
  if (thumbnailFile) formData.append('thumbnail', thumbnailFile);
}

export function validateCategoryForm({
  title,
  description,
  about,
  level,
  price,
  whatYouLearn,
  thumbnailFile,
  isEdit,
  hasExistingThumbnail,
}) {
  const errors = [];

  if (!title?.trim()) errors.push('Category title is required.');
  if (!description?.trim()) errors.push('Short description is required.');
  if (!about?.trim()) errors.push('Detailed description is required.');
  if (!level) errors.push('Level is required.');
  if (
    price !== '' &&
    price !== null &&
    price !== undefined &&
    Number.isNaN(Number(price))
  ) {
    errors.push('Price must be a valid number.');
  }
  if (!whatYouLearn?.some((item) => item.trim() !== '')) {
    errors.push('Add at least one "What the learner will learn" item.');
  }
  if (!isEdit && !thumbnailFile) {
    errors.push('Thumbnail is required.');
  }
  if (isEdit && !thumbnailFile && !hasExistingThumbnail) {
    errors.push('Thumbnail is required.');
  }

  return errors;
}
