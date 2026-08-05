import bcryptjs from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import mongoose from 'mongoose';
import ApiError from '../../errors/ApiError';
import { TRole } from '../../middlewares/roles';
import { enqueueWebNotification } from '../../services/notification.service';
import { User } from '../user.module/user/user.model';
import { IUser } from '../user.module/user/user.interface';
import { UserProfile } from '../user.module/userProfile/userProfile.model';
import { UserDevices } from '../user.module/userDevices/userDevices.model';
import { IUserDevices } from '../user.module/userDevices/userDevices.interface';
import { UserRoleData } from '../user.module/userRoleData/userRoleData.model';
import { MentorProfile } from '../mentor.module/mentorProfile/mentorProfile.model';
import { WalletService } from '../wallet.module/wallet/wallet.service';
import { Wallet } from '../wallet.module/wallet/wallet.model';
import { TokenService } from '../token/token.service';
import { TokenType } from '../token/token.interface';
import { OtpService } from '../otp/otp.service';
import { OtpType } from '../otp/otp.interface';
import { ICreateUser, IGoogleLoginPayload } from './auth.interface';
import { TNotificationType } from '../notification/notification.constants';
import { TAuthProvider } from './auth.constants';
import { OAuthAccount } from '../user.module/oauthAccount/oauthAccount.model';
import { config } from '../../config';
import { Questionary } from '../question.module/questionary/questionary.model';
import { Question } from '../question.module/question/question.model';
import { StudentAnswer } from '../question.module/studentAnswer/studentAnswer.model';
import { StudentQuestionaryTracker } from '../question.module/tracker/tracker.model';
import { TQuestionaryCategory } from '../question.module/question.constant';
import { TCurrency } from '../../enums/payment';
import { Token as TokenModel } from '../token/token.model';
import { TStatusType } from '../user.module/user/user.constant';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const walletService = new WalletService();
const validateUserStatus = (user: IUser) => {
  if (user.isDeleted) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Your account has been deleted. Please contact support.',
    );
  }

  if (user.status === TStatusType.inactive) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Your account is inactive. Please contact support.',
    );
  }

  if (user.status === TStatusType.suspended) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Your account is suspended. Please contact support.',
    );
  }
};

const sanitizeUser = (user: IUser) => {
  const userObject = user.toJSON ? user.toJSON() : user;
  delete userObject.password;
  return userObject;
};

const ensureProfileLink = async (
  userProfileId: string,
  userId: mongoose.Types.ObjectId,
) => {
  await UserProfile.findByIdAndUpdate(userProfileId, { userId });
};

const ensureMentorSideEffects = async (
  userId: mongoose.Types.ObjectId,
  role: TRole,
  message: string,
) => {
  if (role !== TRole.mentor) {
    return;
  }

  // Idempotent: safe on re-register of unverified mentors (no duplicate wallet/profile).
  let wallet = await Wallet.findOne({ userId, isDeleted: false });
  if (!wallet) {
    wallet = await walletService.create({
      userId,
      amount: 0,
      currency: TCurrency.eur,
    });
  }

  await Promise.all([
    User.findByIdAndUpdate(userId, { walletId: wallet._id }),
    MentorProfile.findOneAndUpdate(
      { userId },
      { userId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ),
    UserRoleData.findOneAndUpdate(
      { userId },
      { userId },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ),
  ]);

  // Notify admin — never block mentor registration if queue/redis is down
  try {
    await (enqueueWebNotification as any)(
      message,
      null,
      null,
      TRole.admin,
      TNotificationType.newUser,
      null,
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Mentor registration notification skipped:', (err as Error)?.message);
  }
};

const upsertUserDevice = async (
  userId: mongoose.Types.ObjectId,
  fcmToken?: string,
  deviceInfo?: { deviceType?: string; deviceName?: string },
) => {
  if (!fcmToken) {
    return;
  }

  const deviceType = deviceInfo?.deviceType || 'web';
  const deviceName = deviceInfo?.deviceName || 'Unknown Device';

  let device: IUserDevices | null = await UserDevices.findOne({
    userId,
    fcmToken,
  });

  if (!device) {
    await UserDevices.create({
      userId,
      fcmToken,
      deviceType,
      deviceName,
      lastActive: new Date(),
    });
    return;
  }

  device.lastActive = new Date();
  await (device as any).save();
};

const getOrCreateAssessment = async (userId: string) => {
  let questionary = await Questionary.findOne({ category: TQuestionaryCategory.free, isDeleted: false }).sort({ createdAt: 1 });
  if (!questionary) return null;
  
  let tracker = await StudentQuestionaryTracker.findOne({ studentId: userId, questionaryId: questionary._id });
  if (!tracker) {
    tracker = await StudentQuestionaryTracker.create({
      studentId: userId,
      questionaryId: questionary._id,
      progress: 0
    });
  }
  return { questionary, tracker };
};

const buildOnboardingStatus = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const onboarding = await getOrCreateAssessment(userId);
  if (!onboarding) {
    return {
      hasCompletedQuestionnaire: user.hasCompletedQuestionnaire,
      isCompleted: true,
      progress: { answeredQuestions: 0, totalQuestions: 0, completionPercentage: 100 },
      current: null
    };
  }

  const { questionary, tracker } = onboarding;
  const questionsCount = await Question.countDocuments({ questionaryId: questionary._id, isDeleted: false });
  const answersCount = await StudentAnswer.countDocuments({ studentId: userId, questionaryId: questionary._id, isDeleted: false });

  return {
    hasCompletedQuestionnaire: user.hasCompletedQuestionnaire,
    questionaryId: questionary._id,
    isCompleted: Boolean(tracker.status === 'completed' || user.hasCompletedQuestionnaire),
    progress: {
      answeredQuestions: answersCount,
      totalQuestions: questionsCount,
      completionPercentage: questionsCount ? Math.round((answersCount / questionsCount) * 100) : 0,
    },
    current: {
      questionId: tracker.lastQuestionId || null
    },
  };
};

const createUser = async (userData: ICreateUser, userProfileId: string) => {
  const normalizedEmail = userData.email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (existingUser.isEmailVerified) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken.');
    }

    existingUser.name = userData.name;
    existingUser.password = await bcryptjs.hash(
      userData.password,
      config.bcrypt.saltRounds,
    );
    existingUser.role = userData.role;
    existingUser.profileId = userData.profileId;
    await existingUser.save();
    await ensureProfileLink(userProfileId, existingUser._id);
    await ensureMentorSideEffects(
      existingUser._id,
      userData.role,
      `A ${userData.role} re-registered (unverified). Please review the account.`,
    );

    const verificationToken = await TokenService.createVerifyEmailToken(
      existingUser as unknown as IUser,
    );
    await OtpService.createVerificationEmailOtp(existingUser.email);

    return {
      user: sanitizeUser(existingUser as unknown as IUser),
      verificationToken,
    };
  }

  const hashedPassword = await bcryptjs.hash(
    userData.password,
    config.bcrypt.saltRounds,
  );
  const user = await User.create({
    ...userData,
    email: normalizedEmail,
    password: hashedPassword,
  });

  await ensureProfileLink(userProfileId, user._id);
  await ensureMentorSideEffects(
    user._id,
    userData.role,
    `A ${userData.role} registered successfully. Please review the account.`,
  );

  const verificationToken = await TokenService.createVerifyEmailToken(
    user as unknown as IUser,
  );
  await OtpService.createVerificationEmailOtp(user.email);

  return {
    user: sanitizeUser(user as unknown as IUser),
    verificationToken,
  };
};

const login = async (
  email: string,
  password: string,
  fcmToken?: string,
  deviceInfo?: { deviceType?: string; deviceName?: string },
  rememberMe: boolean = false,
) => {
  console.log(email, password);
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select(
    '+password',
  );

  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials.');
  }

  validateUserStatus(user as unknown as IUser);

  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid credentials.');
  }

  await upsertUserDevice(user._id, fcmToken, deviceInfo);

  const tokens = await TokenService.accessAndRefreshToken(
    user as unknown as IUser,
    rememberMe,
  );

  return {
    userWithoutPassword: sanitizeUser(user as unknown as IUser),
    tokens,
  };
};

const verifyEmail = async (email: string, token: string, otp: string) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  await TokenService.verifyToken(
    token,
    config.token.TokenSecret,
    user.isResetPassword ? TokenType.RESET_PASSWORD : TokenType.VERIFY,
  );

  await OtpService.verifyOTP(
    user.email,
    otp,
    user.isResetPassword ? OtpType.RESET_PASSWORD : OtpType.VERIFY,
  );

  user.isEmailVerified = true;
  user.isResetPassword = false;
  await user.save();

  const tokens = await TokenService.accessAndRefreshToken(
    user as unknown as IUser,
  );

  return { user: sanitizeUser(user as unknown as IUser), tokens };
};

const forgotPassword = async (email: string) => {
  console.log('Email', email);
  const user = await User.findOne({ email: email.trim().toLowerCase(), isDeleted: false });
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const resetPasswordToken = await TokenService.createResetPasswordToken(
    user as unknown as IUser,
  );
  await OtpService.createResetPasswordOtp(user.email);
  user.isResetPassword = true;
  await user.save();

  return { resetPasswordToken };
};

const resendOtp = async (email: string) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  if (user.isResetPassword) {
    const resetPasswordToken = await TokenService.createResetPasswordToken(
      user as unknown as IUser,
    );
    await OtpService.createResetPasswordOtp(user.email);
    return { resetPasswordToken };
  }

  const verificationToken = await TokenService.createVerifyEmailToken(
    user as unknown as IUser,
  );
  await OtpService.createVerificationEmailOtp(user.email);
  return { verificationToken };
};

const resetPassword = async (
  email: string,
  newPassword: string,
  otp: string,
) => {
  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  await OtpService.verifyOTP(
    user.email,
    otp,
    user.isResetPassword ? OtpType.RESET_PASSWORD : OtpType.VERIFY,
  );

  user.password = await bcryptjs.hash(newPassword, config.bcrypt.saltRounds);
  user.isResetPassword = false;
  await user.save();

  return sanitizeUser(user as unknown as IUser);
};

const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const isPasswordValid = await bcryptjs.compare(
    currentPassword,
    user.password,
  );
  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Password is incorrect.');
  }

  user.password = await bcryptjs.hash(newPassword, config.bcrypt.saltRounds);
  user.lastPasswordChange = new Date();
  await user.save();

  return sanitizeUser(user as unknown as IUser);
};

const logout = async (refreshToken: string) => {
  if (!refreshToken) {
    return;
  }

  const storedToken = await TokenModel.findOne({
    token: refreshToken,
    type: TokenType.REFRESH,
  });

  if (!storedToken) {
    return;
  }

  if (storedToken.tokenFamily) {
    await TokenModel.deleteMany({
      user: storedToken.user,
      tokenFamily: storedToken.tokenFamily,
    });
    return;
  }

  await TokenModel.deleteOne({ _id: storedToken._id });
};

const refreshAuth = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Refresh token is required.');
  }

  return TokenService.refreshAccessToken(refreshToken);
};

const startOnboarding = async (userId: string) => {
  await getOrCreateAssessment(userId);
  return buildOnboardingStatus(userId);
};

const getOnboardingStatus = async (userId: string) => {
  return buildOnboardingStatus(userId);
};

const getOnboardingQuestions = async (userId: string, phaseId?: string) => {
  const status = await buildOnboardingStatus(userId);
  if (!status.questionaryId) return { ...status, questions: [] };

  const questions = await Question.find({ questionaryId: status.questionaryId, isDeleted: false }).sort({ sl: 1 });
  return { ...status, questions };
};

const saveOnboardingAnswer = async (
  userId: string,
  payload: {
    questionId: string;
    answer_value: string;
    answer_type: string;
  },
) => {
  const question = await Question.findById(payload.questionId);
  if (!question) throw new ApiError(StatusCodes.NOT_FOUND, 'Question not found.');

  await StudentAnswer.findOneAndUpdate(
    { studentId: userId, questionId: question._id },
    { $set: { answer: payload.answer_value, questionaryId: question.questionaryId } },
    { upsert: true }
  );

  await StudentQuestionaryTracker.findOneAndUpdate(
    { studentId: userId, questionaryId: question.questionaryId },
    { lastQuestionId: question._id }
  );

  return getOnboardingQuestions(userId);
};

const completeOnboarding = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { hasCompletedQuestionnaire: true });
  return buildOnboardingStatus(userId);
};

const googleLogin = async ({
  idToken,
  role,
  acceptTOC,
}: IGoogleLoginPayload) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid Google token.');
  }

  const providerId = payload.sub;
  const email = payload.email.toLowerCase();
  const name = payload.name || email.split('@')[0];
  const picture = payload.picture;

  let oauthAccount = await OAuthAccount.findOne({
    authProvider: TAuthProvider.google,
    providerId,
    isDeleted: false,
  });

  if (oauthAccount) {
    const user = await User.findById(oauthAccount.userId);
    if (!user || user.isDeleted) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Account not found or deleted.',
      );
    }

    await OAuthAccount.findByIdAndUpdate(oauthAccount._id, {
      accessToken: idToken,
      lastUsedAt: new Date(),
    });

    const tokens = await TokenService.accessAndRefreshToken(
      user as unknown as IUser,
    );
    return { user: sanitizeUser(user as unknown as IUser), tokens };
  }

  let user = await User.findOne({ email, isDeleted: false });

  if (user) {
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    await OAuthAccount.create({
      userId: user._id,
      authProvider: TAuthProvider.google,
      providerId,
      email,
      accessToken: idToken,
      isVerified: true,
    });

    const tokens = await TokenService.accessAndRefreshToken(
      user as unknown as IUser,
    );
    return {
      user: sanitizeUser(user as unknown as IUser),
      tokens,
      isLinked: true,
    };
  }

  if (!role || !acceptTOC) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Role and Terms acceptance are required.',
    );
  }

  const userProfile = await UserProfile.create({ acceptTOC: true });
  const newUser = await User.create({
    name,
    email,
    role,
    profileId: userProfile._id,
    isEmailVerified: true,
    authProvider: TAuthProvider.google,
    profileImage: picture ? { imageUrl: picture } : undefined,
  });

  await ensureProfileLink(userProfile._id.toString(), newUser._id);
  await ensureMentorSideEffects(
    newUser._id,
    role,
    `A ${role} registered via Google.`,
  );

  await OAuthAccount.create({
    userId: newUser._id,
    authProvider: TAuthProvider.google,
    providerId,
    email,
    accessToken: idToken,
    isVerified: true,
  });

  const tokens = await TokenService.accessAndRefreshToken(
    newUser as unknown as IUser,
  );
  return {
    user: sanitizeUser(newUser as unknown as IUser),
    tokens,
    isNewUser: true,
  };
};

const appleLogin = async ({
  idToken,
  role,
  acceptTOC,
}: IGoogleLoginPayload) => {
  const applePayload = await appleSignin.verifyIdToken(idToken, {
    audience: process.env.APPLE_CLIENT_ID,
    ignoreExpiration: false,
  });

  const providerId = applePayload.sub;
  const email = applePayload.email?.toLowerCase();

  if (!email) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email not provided by Apple.');
  }

  let oauthAccount = await OAuthAccount.findOne({
    authProvider: TAuthProvider.apple,
    providerId,
    isDeleted: false,
  });

  if (oauthAccount) {
    const user = await User.findById(oauthAccount.userId);
    if (!user || user.isDeleted) {
      throw new ApiError(
        StatusCodes.UNAUTHORIZED,
        'Account not found or deleted.',
      );
    }

    await OAuthAccount.findByIdAndUpdate(oauthAccount._id, {
      accessToken: idToken,
      lastUsedAt: new Date(),
    });

    const tokens = await TokenService.accessAndRefreshToken(
      user as unknown as IUser,
    );
    return { user: sanitizeUser(user as unknown as IUser), tokens };
  }

  let user = await User.findOne({ email, isDeleted: false });
  if (user) {
    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      await user.save();
    }

    await OAuthAccount.create({
      userId: user._id,
      authProvider: TAuthProvider.apple,
      providerId,
      email,
      accessToken: idToken,
      isVerified: true,
    });

    const tokens = await TokenService.accessAndRefreshToken(
      user as unknown as IUser,
    );
    return {
      user: sanitizeUser(user as unknown as IUser),
      tokens,
      isLinked: true,
    };
  }

  if (!role || !acceptTOC) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Role and Terms acceptance are required.',
    );
  }

  const userProfile = await UserProfile.create({ acceptTOC: true });
  const newUser = await User.create({
    name: email.split('@')[0],
    email,
    role,
    profileId: userProfile._id,
    isEmailVerified: true,
    authProvider: TAuthProvider.apple,
  });

  await ensureProfileLink(userProfile._id.toString(), newUser._id);
  await ensureMentorSideEffects(
    newUser._id,
    role,
    `A ${role} registered via Apple.`,
  );

  await OAuthAccount.create({
    userId: newUser._id,
    authProvider: TAuthProvider.apple,
    providerId,
    email,
    accessToken: idToken,
    isVerified: true,
  });

  const tokens = await TokenService.accessAndRefreshToken(
    newUser as unknown as IUser,
  );
  return {
    user: sanitizeUser(newUser as unknown as IUser),
    tokens,
    isNewUser: true,
  };
};

export const AuthService = {
  googleLogin,
  appleLogin,
  createUser,
  createUserV2: createUser,
  login,
  loginV2: login,
  verifyEmail,
  resetPassword,
  forgotPassword,
  resendOtp,
  logout,
  changePassword,
  refreshAuth,
  startOnboarding,
  getOnboardingStatus,
  getOnboardingQuestions,
  saveOnboardingAnswer,
  completeOnboarding,
};
