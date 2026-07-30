import { model, Schema } from 'mongoose';
import { IToken, TokenType } from './token.interface';
import toJSON from '../../common/plugins/toJSON';

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
    required: [true, 'Token is required'],
  },
  type: {
    type: String,
    enum: [
      TokenType.ACCESS,
      TokenType.REFRESH,
      TokenType.RESET_PASSWORD,
      TokenType.VERIFY,
    ],
    required: [true, 'Token type is required'],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  verified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  tokenFamily: {
    type: String,
    required: false,
  },
  rememberMe: {
    type: Boolean,
    default: false,
  },
});

tokenSchema.index({ token: 1 }, { unique: true });
tokenSchema.index({ user: 1, type: 1 });
tokenSchema.index({ user: 1, tokenFamily: 1 });

export const Token  = model<IToken>('Token', tokenSchema) as any;
