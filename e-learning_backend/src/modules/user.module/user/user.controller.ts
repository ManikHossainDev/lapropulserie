//@ts-ignore
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {  UserService } from './user.service';
import { User } from './user.model';
import { GenericController } from '../../_generic-module/generic.controller';
//@ts-ignore
import { Request, Response } from 'express';
import { IUser } from '../../token/token.interface';
import omit from '../../../shared/omit';
import pick from '../../../shared/pick';
import { TokenService } from '../../token/token.service';
import ApiError from '../../../errors/ApiError';
import { TRole } from '../../../middlewares/roles';
import { TJourneyType, TStatusType } from './user.constant';


const sendSuccessResponse = (
  res: Response,
  code: number,
  message: string,
  data: unknown,
  success = true,
) => {
  sendResponse(res, {
    code,
    data,
    message,
    success,
  });
};

const getPaginationQuery = (req: Request, includePopulate = false) => {
  const paginationFields = includePopulate
    ? ['sortBy', 'limit', 'page', 'populate']
    : ['sortBy', 'limit', 'page'];

  return {
    filters: omit(req.query, paginationFields),
    options: pick(req.query, paginationFields),
  };
};

// TODO : IUser should be import from user.interface
export class UserController extends GenericController<typeof User, IUser> {
  userService = new UserService();

  constructor() {
    super(new UserService(), 'User');
  }

  softDeleteById = catchAsync(async (req: Request, res: Response) => {
    // if (!req.params.id) {  //----- Better approach: validate ObjectId
    //   throw new ApiError(
    //     StatusCodes.BAD_REQUEST,
    //     `id is required for delete ${this.modelName}`
    //   );
    // }

    const id = String(req.params.id);
    const deletedObject = await this.userService.softDeleteById(id);
    if (!deletedObject) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        `Object with ID ${id} not found`,
      );
    }
    //   return res.status(StatusCodes.NO_CONTENT).json({});
    sendResponse(res, {
      code: StatusCodes.OK,
      data: deletedObject,
      message: `${this.modelName} soft deleted successfully`,
    });
  });

  //---------------------------------
  // from previous codebase
  //---------------------------------
  createAdminOrSuperAdmin = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await this.userService.createAdminOrSuperAdmin(payload);
    sendResponse(res, {
      code: StatusCodes.CREATED,
      data: result,
      message: `${
        payload.role === 'admin' ? 'Admin' : 'Super Admin'
      } created successfully`,
    });
  });

  /** ---------------------------------------------- kaj Bd
   * @role Admin
   * @Section Settings
   * @module |
   * @figmaIndex 08-01
   * @desc Get Profile Information as logged in user
   *----------------------------------------------*/
  getById = catchAsync(async (req: Request, res: Response) => {
    const id = (req.user as IUser).userId as string;

    // TODO : ⚠️ need to optimize this populate options ..
    const populateOptions = [
      'profileId',
      {
        path: 'profileId',
        select: '-attachments -__v', // TODO MUST : when create profile .. must initiate address and description
        // populate: {
        //   path: 'profileId',
        // }
      },
    ];

    const select = 'name profileImage email phoneNumber role';

    const result = await this.service.getById(id, populateOptions, select);

    // if (!result) {
    //   throw new ApiError(
    //     StatusCodes.NOT_FOUND,
    //     `Object with ID ${id} not found`
    //   );
    // }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} retrieved successfully`,
    });
  });

  // send Invitation Link for a admin
  sendInvitationLinkToAdminEmail = catchAsync(
    async (req: Request, res: Response) => {
      const user = await User.findOne({ email: req.body.email });

      /**
       *
       * req.body.email er email jodi already taken
       * if ----
       * then we check isEmailVerified .. if false .. we make that true
       *
       * if isDeleted true then we make it false
       *
       * else ---
       *  we create new admin and send email
       *
       */

      if (user && user.isEmailVerified === false) {
        // previously isEmailVerified was true
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken');
      } else if (user && user.isDeleted === true) {
        user.isDeleted = false;
        await user.save();
      } else if (user && user.isEmailVerified === false) {
        user.isEmailVerified = true;
        await user.save();
        await TokenService.createVerifyEmailToken(user);
      } else {
        // create new user
        if (req.body.role == TRole.admin) {
          console.log('⚡ Hit because req.body.role = TRole.subAdmin');

          const response = await this.userService.createAdminOrSuperAdmin({
            email: req.body.email,
            password: req.body.password,
            role: req.body.role,
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
          });

          sendResponse(res, {
            code: StatusCodes.OK,
            data: response,
            message: `New admin created and invitation link sent successfully`,
          });
        }
      }
    },
  );

  removeSubAdmin = catchAsync(async (req: Request, res: Response) => {
    const response = await this.userService.removeSubAdmin(
      String(req.params.id),
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: response,
      message: `Account removed successfully`,
    });
  });

  getAdminUserManagementList = catchAsync(
    async (req: Request, res: Response) => {
      const { filters, options } = getPaginationQuery(req);

      const response = await this.userService.getAdminUserManagementList(
        filters as Record<string, unknown>,
        options as Record<string, unknown>,
      );

      sendSuccessResponse(
        res,
        StatusCodes.OK,
        'Admin user management list retrieved successfully',
        response,
      );
    },
  );

  getAdminUserManagementDetails = catchAsync(
    async (req: Request, res: Response) => {
      const response = await this.userService.getAdminUserManagementDetails(
        String(req.params.id),
      );

      sendSuccessResponse(
        res,
        StatusCodes.OK,
        'Admin user details retrieved successfully',
        response,
      );
    },
  );

  updateAdminUserStatus = catchAsync(async (req: Request, res: Response) => {
    const response = await this.userService.updateAdminManagedUserStatus(
      String(req.params.id),
      req.body.status as TStatusType,
    );

    sendSuccessResponse(
      res,
      StatusCodes.OK,
      'User status updated successfully',
      response,
    );
  });

  updateAdminUserJourneyType = catchAsync(
    async (req: Request, res: Response) => {
      const response = await this.userService.updateAdminManagedUserJourneyType(
        String(req.params.id),
        req.body.journeyType as TJourneyType,
      );

      sendSuccessResponse(
        res,
        StatusCodes.OK,
        'User journey type updated successfully',
        response,
      );
    },
  );

  getByIdForAdmin = catchAsync(async (req: Request, res: Response) => {
    const id = (req.user as IUser).userId;

    // TODO : ⚠️ need to optimize this populate options ..
    const populateOptions = [
      'profileId',
      {
        path: 'profileId',
        select: '-attachments -__v', // TODO MUST : when create profile .. must initiate address and description
        // populate: {
        //   path: 'profileId',
        // }
      },
    ];

    const select = 'name profileImage';

    const result = await this.service.getById(
      id as string,
      populateOptions,
      select,
    );

    // if (!result) {
    //   throw new ApiError(
    //     StatusCodes.NOT_FOUND,
    //     `Object with ID ${id} not found`
    //   );
    // }

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `${this.modelName} retrieved successfully`,
    });
  });

  getAllWithPagination = catchAsync(async (req: Request, res: Response) => {
    const filters = omit(req.query, ['sortBy', 'limit', 'page', 'populate']);
    const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

    const populateOptions: any = [
      {
        path: 'profileId',
        select: 'approvalStatus attachments',
        populate: {
          path: 'attachments',
          select: 'attachment attachmentType',
        },
      },
    ];

    const query: Record<string, any> = {};

    // Create a copy of filter without isPreview to handle separately
    const mainFilter = { ...filters };

    // Loop through each filter field and add conditions if they exist
    for (const key of Object.keys(mainFilter)) {
      if (key === 'name' && mainFilter[key] !== '') {
        query[key] = { $regex: mainFilter[key], $options: 'i' }; // Case-insensitive regex search for name
        // } else {
      } else if (
        mainFilter[key] !== '' &&
        mainFilter[key] !== null &&
        mainFilter[key] !== undefined
      ) {
        //---------------------------------
        // In pagination in filters when we pass empty string  it retuns all data
        //---------------------------------
        query[key] = mainFilter[key];
      }
    }

    const select = 'name email role profileImage subscriptionType';

    const result = await this.service.getAllWithPagination(
      query,
      options,
      populateOptions,
      select,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  getAllWithPaginationV2 = catchAsync(async (req: Request, res: Response) => {
    const { filters, options } = getPaginationQuery(req, true);

    const result = await this.userService.getAllWithAggregation(
      filters,
      options,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  getAllWithPaginationV2WithStatistics = catchAsync(
    async (req: Request, res: Response) => {
      const { filters, options } = getPaginationQuery(req, true);

      const query: Record<string, any> = {};

      // Create a copy of filter without isPreview to handle separately
      const mainFilter: Record<string, any> = { ...filters };

      // Loop through each filter field and add conditions if they exist
      for (const key of Object.keys(mainFilter)) {
        if (key === 'name' && mainFilter[key] !== '') {
          query[key] = { $regex: mainFilter[key], $options: 'i' }; // Case-insensitive regex search for name
          // } else {
        } else if (
          mainFilter[key] !== '' &&
          mainFilter[key] !== null &&
          mainFilter[key] !== undefined
        ) {
          //---------------------------------
          // In pagination in filters when we pass empty string  it retuns all data
          //---------------------------------
          query[key] = mainFilter[key];
        }
      }

      const select = 'name email phoneNumber createdAt';

      // const result = await this.userService.getAllWithAggregationWithStatistics(query, options, req.user.userId/*, profileFilter*/);

      const result =
        await this.userService.getAllWithAggregationWithStatistics_V2_ProviderCountFix(
          query,
          options,
          req.user?.userId as string /*, profileFilter*/,
        );

      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: `All ${this.modelName} with pagination`,
        success: true,
      });
    },
  );

  getAllWithPaginationV3 = catchAsync(async (req: Request, res: Response) => {
    const { filters, options } = getPaginationQuery(req, true);

    const result = await this.userService.getAllWithAggregationV2(
      filters,
      /*query,*/ options /*, profileFilter*/,
    );

    sendResponse(res, {
      code: StatusCodes.OK,
      data: result,
      message: `All ${this.modelName} with pagination`,
      success: true,
    });
  });

  changeApprovalStatusByUserId = catchAsync(
    async (req: Request, res: Response) => {
      // const userId = req.params.id;
      const { approvalStatus, userId } = req.query;

      const result = await (
        this.userService as any
      ).changeApprovalStatusByUserId(userId, String(approvalStatus));

      sendResponse(res, {
        code: StatusCodes.OK,
        success: true,
        message: 'Approval status updated successfully',
        data: result,
      });
    },
  );

  getCategoriesAndPopularProvidersForUser = catchAsync(
    async (req: Request, res: Response) => {
      const result = await (
        this.userService as any
      ).getCategoriesAndPopularProvidersForUser();
      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'Categories and popular providers fetched successfully',
        success: true,
      });
    },
  );

  getPopularProvidersForUser = catchAsync(
    async (req: Request, res: Response) => {
      const result = await (
        this.userService as any
      ).getPopularProvidersForUser();
      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'Categories and popular providers fetched successfully',
        success: true,
      });
    },
  );

  getEarningAndCategoricallyBookingCountAndRecentJobRequest = catchAsync(
    async (req: Request, res: Response) => {
      const result = await (
        this.userService as any
      ).getEarningAndCategoricallyBookingCountAndRecentJobRequest(
        req.user?.userId as string,
        String(req.query.type),
      );
      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'Categories and popular providers fetched successfully',
        success: true,
      });
    },
  );

  getProfileInformationOfAUser = catchAsync(
    async (req: Request, res: Response) => {
      const result = await this.userService.getProfileInformationOfAUser(
        req.user as IUser,
      );
      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'Profile information fetched successfully',
        success: true,
      });
    },
  );

  updateProfileInformationOfAUser = catchAsync(
    async (req: Request, res: Response) => {
      // Handle form data: parse 'data' as JSON and set profileImage
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }
      if (req.uploadedFiles?.profileImage) {
        req.body.profileImage = req.uploadedFiles.profileImage;
      }

      const result = await this.userService.updateProfileInformationOfAUser(
        (req.user as IUser).userId as string,
        req.body,
      );

      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'Profile information updated successfully',
        success: true,
      });
    },
  );

  updateProfileInformationOfAdmin = catchAsync(
    async (req: Request, res: Response) => {
      req.body.profileImage = req.uploadedFiles!.profileImage; // it actually returns array of string

      const data = req.body;

      const result = await this.userService.updateProfileInformationOfAdmin(
        (req.user as IUser).userId as string,
        data,
      );
      sendResponse(res, {
        code: StatusCodes.OK,
        data: result,
        message: 'Profile information fetched successfully',
        success: true,
      });
    },
  );
}


