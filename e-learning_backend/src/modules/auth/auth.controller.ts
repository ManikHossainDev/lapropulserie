import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import ApiError from '../../errors/ApiError';
import { AuthService } from './auth.service';
import { ICreateUser, IRegisterData } from './auth.interface';
import { UserProfile } from '../user.module/userProfile/userProfile.model';
import { User } from '../user.module/user/user.model';

const setRefreshCookie = (res: Response, refreshToken: string, rememberMe = false) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
};

const register = catchAsync(async (req: Request, res: Response) => {
  const data = req.body as IRegisterData;

  if (!data.acceptTOC) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Please accept Terms and Conditions before registering.',
    );
  }

  const existingUser = await User.findOne({
    email: data.email.trim().toLowerCase(),
    isDeleted: false,
  }).select('_id isEmailVerified');

  if (existingUser?.isEmailVerified) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken.');
  }

  const userProfile = await UserProfile.create({
    acceptTOC: data.acceptTOC,
  });

  const userDTO: ICreateUser = {
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role,
    profileId: userProfile._id,
  };

  const result = await AuthService.createUser(userDTO, userProfile._id.toString());

  sendResponse(res, {
    code: StatusCodes.CREATED,
    message: 'Account created successfully. Please verify your email to continue.',
    data: result,
    success: true,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password, fcmToken, rememberMe } = req.body;
  const result = await AuthService.login(email, password, fcmToken, undefined, rememberMe);

  setRefreshCookie(res, result.tokens.refreshToken, rememberMe);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User logged in successfully.',
    data: result,
    success: true,
  });
});

const googleAuthCallback = catchAsync(async (req: Request, res: Response) => {
  const { idToken, role, acceptTOC } = req.body;
  const result = await AuthService.googleLogin({ idToken, role, acceptTOC });

  setRefreshCookie(res, result.tokens.refreshToken);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Google login successful.',
    data: result,
    success: true,
  });
});

const appleAuthCallback = catchAsync(async (req: Request, res: Response) => {
  const { idToken, role, acceptTOC } = req.body;
  const result = await AuthService.appleLogin({ idToken, role, acceptTOC });

  setRefreshCookie(res, result.tokens.refreshToken);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Apple login successful.',
    data: result,
    success: true,
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { email, token, otp } = req.body;
  const result = await AuthService.verifyEmail(email, token, otp);

  setRefreshCookie(res, result.tokens.refreshToken);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Email verified successfully.',
    data: result,
    success: true,
  });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.resendOtp(req.body.email);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'OTP sent successfully.',
    data: result,
    success: true,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body.email);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Password reset instructions sent successfully.',
    data: result,
    success: true,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;
  const result = await AuthService.changePassword(userId, currentPassword, newPassword);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Password changed successfully.',
    data: result,
    success: true,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, password, otp } = req.body;
  const result = await AuthService.resetPassword(email, password, otp);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Password reset successfully.',
    data: result,
    success: true,
  });
});

const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
  await AuthService.logout(refreshToken);
  res.clearCookie('refreshToken');

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'User logged out successfully.',
    data: {},
    success: true,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshTokenValue = req.body.refreshToken || req.cookies?.refreshToken;
  const tokens = await AuthService.refreshAuth(refreshTokenValue);

  setRefreshCookie(res, tokens.refreshToken, Boolean(tokens.rememberMe));

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Token refreshed successfully.',
    data: { tokens },
    success: true,
  });
});

const startOnboarding = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.startOnboarding(req.user.userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Onboarding questionnaire initialized successfully.',
    data: result,
    success: true,
  });
});

const getOnboardingStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getOnboardingStatus(req.user.userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Onboarding questionnaire status fetched successfully.',
    data: result,
    success: true,
  });
});

const getOnboardingQuestions = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.getOnboardingQuestions(
    req.user.userId,
    typeof req.query.phaseId === 'string' ? req.query.phaseId : undefined,
  );

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Onboarding questionnaire fetched successfully.',
    data: result,
    success: true,
  });
});

const saveOnboardingAnswer = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.saveOnboardingAnswer(req.user.userId, req.body);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Onboarding answer saved successfully.',
    data: result,
    success: true,
  });
});

const completeOnboarding = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.completeOnboarding(req.user.userId);

  sendResponse(res, {
    code: StatusCodes.OK,
    message: 'Onboarding questionnaire completed successfully.',
    data: result,
    success: true,
  });
});

export const AuthController = {
  register,
  login,
  googleAuthCallback,
  appleAuthCallback,
  verifyEmail,
  resendOtp,
  logout,
  changePassword,
  refreshToken,
  forgotPassword,
  resetPassword,
  startOnboarding,
  getOnboardingStatus,
  getOnboardingQuestions,
  saveOnboardingAnswer,
  completeOnboarding,
};
