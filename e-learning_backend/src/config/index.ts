import dotenv from 'dotenv';
dotenv.config();

export const config = {
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 8080,
  socketPort: process.env.SOCKET || 8080,

  redis: {
    host: process.env.REDIS_HOST, // || 'localhost'
    port: process.env.REDIS_PORT, // || 6380
  },

  // openRouterOrChatGPT: {
  //   openai: {
  //     apiKey: process.env.OPENAI_API_KEY,
  //   },
  // },

  calendly: {
    encryptionKey: process.env.ENCRYPTION_KEY,
  },

  firebase: {
    translation: process.env.Firebase_Service_Account_Path_For_Translation,
  },

  database: {
    mongoUrl:
      process.env.MONGODB_URI ||
      process.env.MONGODB_URL ||
      process.env.MONGO_URL_REMOTE ||
      'mongodb://localhost:27017/mentor-service',
  },

  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ||
      '1018b783185a124050d697313a5dc97f4b7e7f66f4fb82bc7f2998303e48604c',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'bc4b3506f99e4254fc3b8382bf135ffec4a4adf043720555dd0849cb51aa5b02',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION_TIME || '5d',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION_TIME || '365d',
  },

  auth: {
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
    lockTime: parseInt(process.env.LOCK_TIME || '2'),
  },
  adminSeed: {
    enabled: process.env.ADMIN_SEED_ENABLED === 'true',
    name: process.env.ADMIN_SEED_NAME || 'Admin',
    email: process.env.ADMIN_SEED_EMAIL || '',
    password: process.env.ADMIN_SEED_PASSWORD || '',
  },
  studentSeed: {
    enabled: process.env.STUDENT_SEED_ENABLED === 'true',
    name: process.env.STUDENT_SEED_NAME || 'Test Student',
    email: process.env.STUDENT_SEED_EMAIL || 'student@gmail.com',
    password: process.env.STUDENT_SEED_PASSWORD || 'asdfasdf',
  },
  mentorSeed: {
    enabled: process.env.MENTOR_SEED_ENABLED === 'true',
    name: process.env.MENTOR_SEED_NAME || 'Test Mentor',
    email: process.env.MENTOR_SEED_EMAIL || 'mentor1@example.com',
    password: process.env.MENTOR_SEED_PASSWORD || 'asdfasdf',
  },
  token: {
    TokenSecret:
      process.env.TOKEN_SECRET ||
      '065ec2afe73bb1e47454907a56146e5b75ee441af05fe5bb82bdf169a1901d26',
    verifyEmailTokenExpiration:
      process.env.VERIFY_EMAIL_TOKEN_EXPIRATION_TIME || '10m',
    resetPasswordTokenExpiration:
      process.env.RESET_PASSWORD_TOKEN_EXPIRATION_TIME || '5m',
  },

  otp: {
    verifyEmailOtpExpiration: parseInt(
      process.env.VERIFY_EMAIL_OTP_EXPIRATION_TIME || '10',
    ),
    resetPasswordOtpExpiration: parseInt(
      process.env.RESET_PASSWORD_OTP_EXPIRATION_TIME || '5',
    ),
    maxOtpAttempts: parseInt(process.env.MAX_OTP_ATTEMPTS || '5'),
    attemptWindowMinutes: parseInt(process.env.ATTEMPT_WINDOW_MINUTES || '10'),
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
  },

  app: {
    name: process.env.APP_NAME || 'App',
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    username: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
    emailFrom: process.env.EMAIL_FROM || '',
  },

  client: {
    url: process.env.CLIENT_URL || 'http://localhost:3000',
  },

  backend: {
    ip: process.env.BACKEND_IP || 'localhost',
    baseUrl: `http://${process.env.BACKEND_IP}:${process.env.PORT}`,
    shobhoyUrl: process.env.SHOBHOY_URL,
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    stripe_webhook_url: process.env.STRIPE_WEBHOOK_URL,
    success_url: process.env.STRIPE_SUCCESS_URL || `${process.env.BACKEND_IP || 'http://localhost'}:${process.env.PORT || 8080}/payment-success`,
    cancel_url: process.env.STRIPE_CANCEL_URL || `${process.env.BACKEND_IP || 'http://localhost'}:${process.env.PORT || 8080}/payment-cancel`,
    standard_plan_price_id: process.env.STRIPE_STANDARD_PLAN_PRICE_ID,
  },
  aws: {
    awsBucketName: process.env.AWS_BUCKET_NAME,
    awsApiKey: process.env.AWS_API_KEY || process.env.AWS_ACCESS_KEY_ID,
    awsSecretKey: process.env.AWS_SECRET_KEY || process.env.AWS_SECRET_ACCESS_KEY,
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    awsPublicBaseUrl: process.env.AWS_PUBLIC_BASE_URL,
  },
};
