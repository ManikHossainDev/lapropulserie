import { Response } from 'express';

type ResponseMeta = Record<string, unknown>;

type IData<T> = {
  code: number;
  message?: string;
  data?: T;
  success?: boolean;
  meta?: ResponseMeta;
};

type IErrorDetail = {
  path?: string;
  message: string;
  [key: string]: unknown;
};

type IErrorResponse = {
  code: number;
  message: string;
  errors?: IErrorDetail[] | string | unknown;
  stack?: string;
  meta?: ResponseMeta;
};

const isPlainObject = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const buildPaginationMeta = (meta?: ResponseMeta): ResponseMeta | undefined => {
  if (!meta || !isPlainObject(meta)) {
    return undefined;
  }

  const normalizedMeta: ResponseMeta = { ...meta };

  if (
    typeof normalizedMeta.total !== 'number' &&
    typeof normalizedMeta.totalResults === 'number'
  ) {
    normalizedMeta.total = normalizedMeta.totalResults;
  }

  if (
    typeof normalizedMeta.totalPages !== 'number' &&
    typeof normalizedMeta.totalPage === 'number'
  ) {
    normalizedMeta.totalPages = normalizedMeta.totalPage;
  }

  delete normalizedMeta.totalResults;
  delete normalizedMeta.totalPage;

  const page =
    typeof normalizedMeta.page === 'number' ? normalizedMeta.page : undefined;
  const totalPages =
    typeof normalizedMeta.totalPages === 'number'
      ? normalizedMeta.totalPages
      : undefined;

  if (page !== undefined && totalPages !== undefined) {
    if (typeof normalizedMeta.hasNextPage !== 'boolean') {
      normalizedMeta.hasNextPage = page < totalPages;
    }

    if (typeof normalizedMeta.hasPrevPage !== 'boolean') {
      normalizedMeta.hasPrevPage = page > 1;
    }
  }

  return Object.keys(normalizedMeta).length ? normalizedMeta : undefined;
};

const extractPaginatedPayload = (data: unknown) => {
  if (!isPlainObject(data) || !Array.isArray(data.results)) {
    return null;
  }

  if (isPlainObject(data.meta)) {
    return {
      data: data.results,
      meta: buildPaginationMeta(data.meta),
    };
  }

  if (typeof data.page === 'number' && typeof data.limit === 'number') {
    return {
      data: data.results,
      meta: buildPaginationMeta({
        page: data.page,
        limit: data.limit,
        total: data.totalResults,
        totalPages: data.totalPages,
      }),
    };
  }

  return null;
};

export const sendErrorResponse = (
  res: Response,
  data: IErrorResponse,
) => {
  const responseBody = {
    success: false,
    code: data.code,
    message: data.message,
    ...(data.errors !== undefined ? { errors: data.errors } : {}),
    ...(data.meta ? { meta: data.meta } : {}),
    ...(data.stack ? { stack: data.stack } : {}),
  };

  return res.status(data.code).json(responseBody);
};

const sendResponse = <T>(res: Response, data: IData<T>) => {
  const extractedPagination = extractPaginatedPayload(data.data);
  const responseMeta = buildPaginationMeta({
    ...(extractedPagination?.meta || {}),
    ...(data.meta || {}),
  });

  const responseBody = {
    success: data.success ?? data.code < 400,
    code: data.code,
    message: data.message ?? 'Request completed successfully.',
    data:
      extractedPagination?.data ??
      (data.data === undefined ? null : data.data),
    ...(responseMeta ? { meta: responseMeta } : {}),
  };

  return res.status(data.code).json(responseBody);
};

export default sendResponse;
