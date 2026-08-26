/**
 * User Routes Module
 *
 * This module defines all user-related endpoints including:
 * - User management (admin operations)
 * - User profiles and information
 * - User pagination and filtering
 * - Admin user management
 * - Profile updates and image uploads
 * - User status and approval management
 *
 * Security Features:
 * - Authentication middleware for protected routes
 * - Input validation using Zod schemas
 * - Role-based access control (Admin, User, Student, Mentor)
 * - Query validation for pagination and filtering
 *
 * @module UserRoutes
 */

import express, { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserController } from './user.controller';
import { validateFiltersForQuery } from '../../../middlewares/queryValidation/paginationQueryValidationMiddleware';
import auth from '../../../middlewares/auth';
import { IUser } from './user.interface';
import { TRole } from '../../../middlewares/roles';
import validateRequest from '../../../shared/validateRequest';
import * as validation from './user.validation';
import { setRequestFilterAndValue } from '../../../middlewares/setRequestFilterAndValue';
import { imageUploadPipelineForUpdateUserProfile } from './user.middleware';
import ApiError from '../../../errors/ApiError';
import { IsProviderRejected } from '../../../middlewares/provider/IsProviderRejected';

export const optionValidationChecking = <
  T extends
    | keyof IUser
    | 'sortBy'
    | 'page'
    | 'limit'
    | 'populate'
    | 'from'
    | 'to'
    | 'providerApprovalStatus',
>(
  filters: T[],
) => {
  return filters;
};

const paginationOptions: Array<'sortBy' | 'page' | 'limit' | 'populate'> = [
  'sortBy',
  'page',
  'limit',
  'populate',
];

const router = express.Router();
const controller = new UserController();

const adminPaginatedUserFilters = [
  '_id',
  'name',
  'createdAt',
  'from',
  'to',
  ...paginationOptions,
] as const;

const registerRolePaginatedRoute = (path: string, role: string) => {
  router
    .route(path)
    .get(
      auth(TRole.admin),
      validateFiltersForQuery(
        optionValidationChecking([...adminPaginatedUserFilters]),
      ),
      setRequestFilterAndValue('role', role),
      controller.getAllWithPaginationV2,
    );
};

// ============================================================================
// ADMIN USER MANAGEMENT ROUTES
// ============================================================================

/**
 * @route GET /users/admin/management
 * @description Get admin user management list
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminUserManagementListValidationSchema
 * @returns {Object} Paginated user management list
 */
router
  .route('/admin/management')
  .get(
    auth(TRole.admin),
    validateRequest(validation.adminUserManagementListValidationSchema),
    controller.getAdminUserManagementList,
  );

/**
 * @route GET /users/admin/management/:id
 * @description Get admin user management details by ID
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminUserManagementIdValidationSchema
 * @param {string} id - User ID
 * @returns {Object} User management details
 */
router
  .route('/admin/management/:id')
  .get(
    auth(TRole.admin),
    validateRequest(validation.adminUserManagementIdValidationSchema),
    controller.getAdminUserManagementDetails,
  );

/**
 * @route PATCH /users/admin/management/:id/status
 * @description Update user status
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminUserStatusUpdateValidationSchema
 * @param {string} id - User ID
 * @returns {Object} Updated user status
 */
router
  .route('/admin/management/:id/status')
  .patch(
    auth(TRole.admin),
    validateRequest(validation.adminUserStatusUpdateValidationSchema),
    controller.updateAdminUserStatus,
  );

/**
 * @route PATCH /users/admin/management/:id/journey-type
 * @description Update user journey type
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminUserJourneyTypeUpdateValidationSchema
 * @param {string} id - User ID
 * @returns {Object} Updated user journey type
 */
router
  .route('/admin/management/:id/journey-type')
  .patch(
    auth(TRole.admin),
    validateRequest(validation.adminUserJourneyTypeUpdateValidationSchema),
    controller.updateAdminUserJourneyType,
  );

/**
 * @route PATCH /users/admin/management/:id/soft-delete
 * @description Soft delete user by ID
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminUserManagementIdValidationSchema
 * @param {string} id - User ID
 * @returns {Object} Soft deletion confirmation
 */
router
  .route('/admin/management/:id/soft-delete')
  .patch(
    auth(TRole.admin),
    validateRequest(validation.adminUserManagementIdValidationSchema),
    controller.softDeleteById,
  );

// ============================================================================
// USER PAGINATION ROUTES
// ============================================================================

/**
 * @route GET /users/paginate
 * @description Get all users with pagination and statistics
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @query {string} [_id] - Filter by user ID
 * @query {string} [name] - Filter by user name
 * @query {string} [createdAt] - Filter by creation date
 * @query {string} [sortBy] - Sort field
 * @query {number} [page] - Page number
 * @query {number} [limit] - Items per page
 * @query {string} [populate] - Population options
 * @returns {Object} Paginated user list with statistics
 */
router
  .route('/paginate')
  .get(
    auth(TRole.admin),
    validateFiltersForQuery(
      optionValidationChecking([
        '_id',
        'name',
        'createdAt',
        ...paginationOptions,
      ]),
    ),
    setRequestFilterAndValue('role', 'user'),
    controller.getAllWithPaginationV2WithStatistics,
  );

registerRolePaginatedRoute('/paginate/for-student', 'student');
registerRolePaginatedRoute('/paginate/for-mentor', 'mentor');
registerRolePaginatedRoute('/paginate/for-sub-admin', 'subAdmin');

/**
 * @route POST /users/send-invitation-link-to-admin-email
 * @description Send invitation link to become admin
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation sendInvitationToBeAdminValidationSchema
 * @returns {Object} Invitation sent confirmation
 */
router.post(
  '/send-invitation-link-to-admin-email',
  auth(TRole.admin),
  validateRequest(validation.sendInvitationToBeAdminValidationSchema),
  controller.sendInvitationLinkToAdminEmail,
);

/**
 * @route PUT /users/remove-sub-admin/:id
 * @description Remove sub-admin role from user
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @param {string} id - User ID
 * @returns {Object} Role removal confirmation
 */
router.put(
  '/remove-sub-admin/:id',
  auth(TRole.admin),
  controller.removeSubAdmin,
);

/**
 * @route GET /users/paginate/for-provider
 * @description Get all providers with pagination
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @query {string} [_id] - Filter by user ID
 * @query {string} [name] - Filter by user name
 * @query {string} [email] - Filter by email
 * @query {string} [phoneNumber] - Filter by phone number
 * @query {string} [role] - Filter by role
 * @query {string} [providerApprovalStatus] - Filter by approval status
 * @query {string} [from] - Filter from date
 * @query {string} [to] - Filter to date
 * @returns {Object} Paginated provider list
 */
router
  .route('/paginate/for-provider')
  .get(
    auth(TRole.admin),
    validateFiltersForQuery(
      optionValidationChecking([
        '_id',
        'name',
        'email',
        'phoneNumber',
        'role',
        'providerApprovalStatus',
        'from',
        'to',
        ...paginationOptions,
      ]),
    ),
    controller.getAllWithPaginationV3,
  );

// ============================================================================
// USER PROFILE ROUTES
// ============================================================================

/**
 * @route GET /users/profile
 * @description Get user profile by ID
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} User profile data
 */
router.route('/profile').get(auth(TRole.common), controller.getById);

/**
 * @route GET /users/profile/for-admin
 * @description Get all user profiles for admin
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @query {string} [_id] - Filter by user ID
 * @returns {Object} Paginated user profile list
 */
router
  .route('/profile/for-admin')
  .get(
    auth(TRole.admin),
    validateFiltersForQuery(
      optionValidationChecking(['_id', ...paginationOptions]),
    ),
    controller.getAllWithPagination,
  );

/**
 * @route PUT /users/change-approval-status
 * @description Change user approval status
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @returns {Object} Updated approval status
 */
router
  .route('/change-approval-status')
  .put(auth(TRole.admin), controller.changeApprovalStatusByUserId);

// ============================================================================
// HOME PAGE ROUTES
// ============================================================================

/**
 * @route GET /users/home-page
 * @description Get categories and popular providers for user home page
 * @access Public
 * @returns {Object} Categories and popular providers
 */
router
  .route('/home-page')
  .get(controller.getCategoriesAndPopularProvidersForUser);

/**
 * @route GET /users/home-page/popular
 * @description Get popular providers for user
 * @access Public
 * @returns {Object} Popular providers list
 */
router.route('/home-page/popular').get(controller.getPopularProvidersForUser);

/**
 * @route GET /users/home-page/for-provider
 * @description Get earning and booking count for provider
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @middleware IsProviderRejected()
 * @returns {Object} Earning and booking statistics
 */
router
  .route('/home-page/for-provider')
  .get(
    auth(TRole.common),
    IsProviderRejected(),
    controller.getEarningAndCategoricallyBookingCountAndRecentJobRequest,
  );

// ============================================================================
// PROFILE INFORMATION ROUTES
// ============================================================================

/**
 * @route GET /users/profile-info
 * @description Get profile information of a user
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common)
 * @returns {Object} User profile information
 */
router
  .route('/profile-info')
  .get(auth(TRole.common), controller.getProfileInformationOfAUser);

/**
 * @route PUT /users/profile-info
 * @description Update profile information of a user
 * @access Private (Authenticated users)
 * @middleware auth(TRole.common), imageUploadPipelineForUpdateUserProfile
 * @validation updateProfileInfoValidationSchema
 * @returns {Object} Updated profile information
 */
router
  .route('/profile-info')
  .put(
    auth(TRole.common),
    ...imageUploadPipelineForUpdateUserProfile,
    (req: Request, _res: Response, next: NextFunction) => {
      try {
        if (typeof req.body?.data === 'string') {
          const parsed = JSON.parse(req.body.data);
          req.body = { ...parsed };
        }
        if ((req as any).uploadedFiles?.profileImage) {
          req.body.profileImage = (req as any).uploadedFiles.profileImage;
        }
        next();
      } catch {
        next(new ApiError(StatusCodes.BAD_REQUEST, 'Invalid profile payload'));
      }
    },
    validateRequest(validation.updateProfileInfoValidationSchema),
    controller.updateProfileInformationOfAUser,
  );

/**
 * @route PUT /users/profile-info/for-admin
 * @description Update profile information of admin with profile image
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @middleware imageUploadPipelineForUpdateUserProfile
 * @returns {Object} Updated admin profile information
 */
router
  .route('/profile-info/for-admin')
  .put(
    auth(TRole.admin),
    ...imageUploadPipelineForUpdateUserProfile,
    controller.updateProfileInformationOfAdmin,
  );

// ============================================================================
// USER UPDATE AND DELETE ROUTES
// ============================================================================

/**
 * @route PUT /users/update/:id
 * @description Update user by ID
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminUserManagementIdValidationSchema
 * @param {string} id - User ID
 * @returns {Object} Updated user data
 */
router
  .route('/update/:id')
  .put(
    auth(TRole.admin),
    validateRequest(validation.adminUserManagementIdValidationSchema),
    controller.updateById,
  );

/**
 * @route GET /users/
 * @description Get all users
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @returns {Object} List of all users
 */
router.route('/').get(auth(TRole.admin), controller.getAll);

/**
 * @route PUT /users/delete-my-account
 * @description Soft-delete the authenticated user's own account
 * @access Private (student / mentor)
 */
router
  .route('/delete-my-account')
  .put(auth(TRole.commonUser), controller.deleteMyAccount);

/**
 * @route PUT /users/softDelete/:id
 * @description Soft delete user by ID
 * @access Private (Admin role required)
 * @middleware auth(TRole.admin)
 * @validation adminUserManagementIdValidationSchema
 * @param {string} id - User ID
 * @returns {Object} Soft deletion confirmation
 */
router
  .route('/softDelete/:id')
  .put(
    auth(TRole.admin),
    validateRequest(validation.adminUserManagementIdValidationSchema),
    controller.softDeleteById,
  );

export const UserRoutes = router;
