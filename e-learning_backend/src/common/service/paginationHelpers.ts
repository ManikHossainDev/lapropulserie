import PaginationService from "./paginationService";

// utils/paginationHelpers.js
export class PaginationHelpers {
  // Extract pagination params from request query
  static extractPaginationFromQuery(query: any) {
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(Number(query.limit) || 10, 100);
    return { page, limit };
  }

  // Extract sort params from request query
  static extractSortFromQuery(query: any) {
    return PaginationService.buildSortObject(query.sortBy || query.sort);
  }

  // Build populate array from query string
  static buildPopulateFromQuery(populate?: string) {
    if (!populate) return [];
    return populate.split(',').map(field => field.trim());
  }

  // Build response metadata
  static buildPaginationMeta(paginateResult: any) {
    return {
      currentPage: paginateResult.page,
      totalPages: paginateResult.totalPages,
      totalResults: paginateResult.totalResults,
      hasNextPage: paginateResult.hasNextPage,
      hasPrevPage: paginateResult.hasPrevPage,
      limit: paginateResult.limit
    };
  }
}
