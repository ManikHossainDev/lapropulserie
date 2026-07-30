//@ts-ignore
import { Schema } from 'mongoose';

const isObjectIdLike = (value: any) => {
  return (
    value &&
    (value?._bsontype === 'ObjectId' ||
      typeof value?.toHexString === 'function' ||
      value?.constructor?.name === 'ObjectId')
  );
};

const isBufferLike = (value: any) => {
  return (
    value &&
    (Buffer.isBuffer(value) ||
      value?.type === 'Buffer' ||
      value?.constructor?.name === 'Binary')
  );
};

const transformNested = (value: any): any => {
  if (value === null || value === undefined) {
    return value;
  }

  if (isObjectIdLike(value)) {
    return value.toHexString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (isBufferLike(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(transformNested);
  }

  if (typeof value === 'object') {
    const transformed: Record<string, any> = {};

    Object.entries(value).forEach(([key, nestedValue]) => {
      if (key === '__v') {
        return;
      }

      if (key === '_id') {
        transformed.id = transformNested(nestedValue);
        return;
      }

      transformed[key] = transformNested(nestedValue);
    });

    return transformed;
  }

  return value;
};

const toJSON = <T>(schema: Schema<T>) => {
  schema.set('toJSON', {
    transform: function (_doc: any, ret: any) {
      return transformNested(ret);
    },
  });
};

export default toJSON;
