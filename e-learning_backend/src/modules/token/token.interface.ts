//@ts-ignore
import { Types } from 'mongoose';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY = 'verify',
}
export interface IToken {
  _id: string;
  user?: Types.ObjectId;
  token: string;
  verified: boolean;
  expiresAt: Date;
  type: TokenType;
  tokenFamily?: string; // For refresh token rotation tracking
  rememberMe?: boolean; // For 30-day refresh token
}

export interface IUser {
  userId: string | undefined;
  userName?: string;
  email: string;
  role: string;
  stripe_customer_id: string | null;
  subscriptionPlan: 'none'; // ENUM
}

