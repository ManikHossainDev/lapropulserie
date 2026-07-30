import rateLimit from 'express-rate-limit';

const authRateLimiterMessage = {
  success: false,
  message: 'Too many auth attempts. Please try again after 1 minute.',
};

const getAuthRateLimitKey = (req: any) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  return email ? `${email}:${ip}` : ip;
};

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getAuthRateLimitKey,
  message: authRateLimiterMessage,
});
