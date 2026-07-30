import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { addDays, addMinutes } from 'date-fns';
import { randomUUID } from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { config } from '../../config';
import ApiError from '../../errors/ApiError';
import { User } from '../user.module/user/user.model';
import { IUser as IUserMain } from '../user.module/user/user.interface';
import { Token } from './token.model';
import { TokenType } from './token.interface';

const getExpirationTime = (expiration: string) => {
  const timeValue = parseInt(expiration, 10);

  if (expiration.includes('d')) {
    return addDays(new Date(), timeValue);
  }

  if (expiration.includes('h')) {
    return addMinutes(new Date(), timeValue * 60);
  }

  if (expiration.includes('m')) {
    return addMinutes(new Date(), timeValue);
  }

  return new Date();
};

const createToken = (payload: object, secret: Secret, expireTime: string) => {
  // Convert minute-based expiration to seconds for JWT compatibility
  // JWT library doesn't recognize 'm' for minutes, so we convert it
  let jwtExpiration = expireTime;
  if (expireTime.includes('m') && !expireTime.includes('h')) {
    const minutes = parseInt(expireTime, 10);
    jwtExpiration = `${minutes * 60}s`;
  }
  
  return jwt.sign(payload, secret, { expiresIn: jwtExpiration } as any) as string;
};

const verifyToken = async (token: string, secret: Secret, tokenType: TokenType) => {
  const decoded = jwt.verify(token, secret) as JwtPayload;

  const storedToken = await Token.findOne({
    token,
    user: decoded.userId,
    type: tokenType,
  });

  if (!storedToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Token is invalid or already used.');
  }

  if (storedToken.expiresAt < new Date()) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Token has expired.');
  }

  if (storedToken.type !== tokenType) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid token type.');
  }

  storedToken.verified = true;
  await storedToken.save();

  return decoded;
};

const createVerifyEmailToken = async (user: IUserMain) => {
  const payload = { userId: user._id, email: user.email, role: user.role };
  const verifyEmailToken = createToken(
    payload,
    config.token.TokenSecret,
    config.token.verifyEmailTokenExpiration,
  );

  await Token.deleteMany({
    user: user._id,
    type: { $in: [TokenType.VERIFY, TokenType.RESET_PASSWORD] },
  });

  await Token.create({
    token: verifyEmailToken,
    user: user._id,
    type: TokenType.VERIFY,
    expiresAt: getExpirationTime(config.token.verifyEmailTokenExpiration),
  });

  return verifyEmailToken;
};

const createResetPasswordToken = async (user: IUserMain) => {
  const payload = { userId: user._id, email: user.email, role: user.role };
  const resetPasswordToken = createToken(
    payload,
    config.token.TokenSecret,
    config.token.resetPasswordTokenExpiration,
  );

  await Token.deleteMany({
    user: user._id,
    type: { $in: [TokenType.VERIFY, TokenType.RESET_PASSWORD] },
  });

  await Token.create({
    token: resetPasswordToken,
    user: user._id,
    type: TokenType.RESET_PASSWORD,
    expiresAt: getExpirationTime(config.token.resetPasswordTokenExpiration),
  });

  return resetPasswordToken;
};

const accessAndRefreshToken = async (
  user: IUserMain,
  rememberMe = false,
  tokenFamily?: string,
) => {
  const payload = {
    userId: user._id,
    userName: user.name,
    email: user.email,
    role: user.role,
  };

  const resolvedTokenFamily = tokenFamily || randomUUID();
  const refreshTokenExpiration = rememberMe ? '30d' : config.jwt.refreshExpiration;

  const accessToken = createToken(payload, config.jwt.accessSecret, config.jwt.accessExpiration);
  const refreshToken = createToken(payload, config.jwt.refreshSecret, refreshTokenExpiration);

  await Token.create([
    {
      token: accessToken,
      user: user._id,
      type: TokenType.ACCESS,
      expiresAt: getExpirationTime(config.jwt.accessExpiration),
      tokenFamily: resolvedTokenFamily,
    },
    {
      token: refreshToken,
      user: user._id,
      type: TokenType.REFRESH,
      expiresAt: getExpirationTime(refreshTokenExpiration),
      tokenFamily: resolvedTokenFamily,
      rememberMe,
    },
  ]);

  return { accessToken, refreshToken, tokenFamily: resolvedTokenFamily, rememberMe };
};

const refreshAccessToken = async (refreshToken: string) => {
  const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;

  const storedRefreshToken = await Token.findOne({
    token: refreshToken,
    user: decoded.userId,
    type: TokenType.REFRESH,
  });

  if (!storedRefreshToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Refresh token is invalid or already used.');
  }

  if (storedRefreshToken.expiresAt < new Date()) {
    await Token.deleteOne({ _id: storedRefreshToken._id });
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Refresh token has expired.');
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  await Token.deleteMany({
    user: decoded.userId,
    tokenFamily: storedRefreshToken.tokenFamily,
  });

  return accessAndRefreshToken(
    user as unknown as IUserMain,
    Boolean(storedRefreshToken.rememberMe),
    storedRefreshToken.tokenFamily,
  );
};

export const TokenService = {
  createToken,
  verifyToken,
  createVerifyEmailToken,
  createResetPasswordToken,
  accessAndRefreshToken,
  refreshAccessToken,
};
