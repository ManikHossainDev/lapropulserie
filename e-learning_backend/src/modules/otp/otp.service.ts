import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
import ApiError from '../../errors/ApiError';
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from '../../helpers/emailService';
import OTP from './otp.model';
import { config } from '../../config';
import { User } from '../user.module/user/user.model';

import EventEmitter from 'events';
const eventEmitterForOTPCreateAndSendMail = new EventEmitter(); // functional way

eventEmitterForOTPCreateAndSendMail.on(
  'eventEmitterForOTPCreateAndSendMail',
  async (valueFromRequest: any) => {
    try {
      let userName = valueFromRequest.name;
      if (!userName && valueFromRequest.email) {
        const user = await User.findOne({
          email: valueFromRequest.email.trim().toLowerCase(),
        })
          .select('name')
          .lean();
        if (user?.name) {
          userName = user.name;
        }
      }

      const expiration = config.otp.verifyEmailOtpExpiration;
      const otpDoc = await createOTP(
        valueFromRequest.email,
        expiration.toString(),
        'verify',
      );
      await sendVerificationEmail(
        valueFromRequest.email,
        otpDoc.otp,
        userName,
        expiration,
      );
    } catch (error) {
      console.error(
        'Error occurred while handling token creation and deletion:',
        error,
      );
    }
  },
);

export default eventEmitterForOTPCreateAndSendMail;

const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

const createOTP = async (
  userEmail: string,
  expiresInMinutes: string,
  type: string,
) => {
  const existingOTP = await OTP.findOne({
    userEmail,
    type,
    verified: false,
    expiresAt: { $gt: new Date() },
  });
  if (existingOTP) {
    const windowStart = moment()
      .subtract(config.otp.attemptWindowMinutes, 'minutes')
      .toDate();
    if (
      existingOTP.attempts >= config.otp.maxOtpAttempts &&
      existingOTP.lastAttemptAt &&
      existingOTP.lastAttemptAt > windowStart
    ) {
      throw new ApiError(
        StatusCodes.TOO_MANY_REQUESTS,
        `Too many attempts. Please try again after ${config.otp.attemptWindowMinutes} minutes`,
      );
    }
  }
  await OTP.deleteMany({ userEmail, type });
  const otp = generateOTP();
  const otpDoc = await OTP.create({
    userEmail,
    otp,
    type,
    expiresAt: moment.utc().add(parseInt(expiresInMinutes), 'minutes').toDate(),
  });
  return otpDoc;
};

const verifyOTP = async (userEmail: string, otp: string, type: string) => {
  const otpDoc = await OTP.findOne({
    userEmail,
    type,
    verified: false,
  });

  if (!otpDoc || otpDoc.expiresAt < new Date()) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'OTP not found or expired');
  }
  otpDoc.attempts += 1;
  otpDoc.lastAttemptAt = new Date();
  if (otpDoc.attempts > config.otp.maxOtpAttempts) {
    await otpDoc.save();
    throw new ApiError(
      StatusCodes.TOO_MANY_REQUESTS,
      `Too many attempts. Please try again after ${config.otp.attemptWindowMinutes} minutes`,
    );
  }
  if (otpDoc.otp !== otp) {
    await otpDoc.save();
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid OTP');
  }
  otpDoc.verified = true;
  await otpDoc.save();
  return true;
};

const createVerificationEmailOtp = async (email: string, name?: string) => {
  let userName = name;
  if (!userName) {
    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select('name')
      .lean();
    if (user?.name) {
      userName = user.name;
    }
  }

  const expiration = config.otp.verifyEmailOtpExpiration;
  const otpDoc = await createOTP(
    email,
    expiration.toString(),
    'verify',
  );
  await sendVerificationEmail(email, otpDoc.otp, userName, expiration);
  return otpDoc;
};

const createResetPasswordOtp = async (email: string, name?: string) => {
  let userName = name;
  if (!userName) {
    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select('name')
      .lean();
    if (user?.name) {
      userName = user.name;
    }
  }

  const expiration = config.otp.resetPasswordOtpExpiration;
  const otpDoc = await createOTP(
    email,
    expiration.toString(),
    'resetPassword',
  );
  await sendResetPasswordEmail(email, otpDoc.otp, userName, expiration);
  return otpDoc;
};

export const OtpService = {
  createOTP,
  verifyOTP,
  createVerificationEmailOtp,
  createResetPasswordOtp,
};
