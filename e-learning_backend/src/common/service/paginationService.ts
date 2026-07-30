//@ts-ignore
import { Schema } from 'mongoose';

export interface PaginateOptions {
  page?: number;
  limit?: number;
  sortBy?: string | object;
  populate?: any[];
  select?: string;
}

export interface PaginateResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AggregationPaginateOptions {
  page?: number;
  limit?: number;
  countField?: string;
}

export interface AggregationPaginateResult<T> {
  results: T[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

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

const normalizeAggregationValue = (value: any): any => {
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
    return value.map(normalizeAggregationValue);
  }

  if (typeof value === 'object') {
    const normalized: Record<string, any> = {};

    Object.entries(value).forEach(([key, nestedValue]) => {
      if (key === '__v') {
        return;
      }

      if (key === '_id') {
        normalized.id = normalizeAggregationValue(nestedValue);
        return;
      }

      normalized[key] = normalizeAggregationValue(nestedValue);
    });

    return normalized;
  }

  return value;
};

export const normalizeAggregationDocument = <T>(document: T): T => {
  return normalizeAggregationValue(document) as T;
};

class PaginationService {
  static async aggregationPaginate<T>(
    model: any,
    pipeline: any[] = [],
    options: any,
  ): Promise<AggregationPaginateResult<T>> {
    const limit = Math.min(options.limit ?? 10, 100);
    const page = Math.max(options.page ?? 1, 1);
    const skip = (page - 1) * limit;

    const paginationPipeline = [
      ...pipeline,
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await model.aggregate(paginationPipeline).exec();

    return {
      results: normalizeAggregationDocument(result?.data || []),
      page,
      limit,
      totalPages: Math.ceil((result?.totalCount?.[0]?.count || 0) / limit),
      totalResults: result?.totalCount?.[0]?.count || 0,
    };
  }

  static buildSortObject(sortBy?: string) {
    if (!sortBy) {
      return { createdAt: -1 };
    }

    if (sortBy.startsWith('-')) {
      const field = sortBy.substring(1);
      return { [field]: -1 };
    }

    if (sortBy.includes(':')) {
      const [field, direction] = sortBy.split(':');
      return { [field || 'createdAt']: direction === 'desc' ? -1 : 1 };
    }

    return { [sortBy]: 1 };
  }
}

export default PaginationService;
