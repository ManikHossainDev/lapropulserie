import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import path from 'path';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';
import router from './routes';
import { Morgan } from './shared/morgen';
import i18next from './i18n/i18n'; // Import the i18next configuration
import i18nextMiddleware from 'i18next-http-middleware';
import webhookHandler from './modules/payment.module/stripeWebhook/webhookHandler';
import { welcome } from './utils/welcome';
import {
  calendlyOAuthCallbackHandlerV2,
  calendlyWebHookHandler,
} from './modules/calendly.module/webhookHandler';
import { verifyCalendlySignature } from './middlewares/calendly/verifyCalendlySignature';
import sendResponse, { sendErrorResponse } from './shared/sendResponse';
// import i18nextFsBackend from 'i18next-fs-backend';

/*-─────────────────────────────────
|  This payment.bootstrap.ts import is important for payment by stripe
└──────────────────────────────────*/
import './modules/payment.module/payment/payment.bootstrap';

const app = express();

//---------------------------------
// for payment related thing.. we need to use view engine ..
//---------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Capsule/video payloads must not be served via 304 — clients need fresh URLs after admin edits
app.set('etag', false);

// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// body parser
app.use(
  cors({
    origin: true, // Allow all origins
    credentials: true,
  }),
);
app.get(
  '/api/calendly/callback',
  //  express.raw({ type: 'application/json'  }),
  calendlyOAuthCallbackHandlerV2,
);

// app.get('/api/calendly/:id/dashboard',
// calendlyOAuthCallbackHandlerV2);

app.post(
  '/api/v1/stripe/webhook',
  express.raw({ type: 'application/json' }),
  webhookHandler,
);

// Step 2: Handle OAuth callback

app.post(
  '/api/webhooks/calendly',
  express.raw({ type: 'application/json', limit: '1mb' }),
  verifyCalendlySignature,
  calendlyWebHookHandler,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use cookie-parser to parse cookies
app.use(cookieParser());

// file retrieve
app.use('/uploads', express.static(path.join(__dirname, '../uploads/')));

// Use i18next middleware
app.use(i18nextMiddleware.handle(i18next));

// router
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  res.send(welcome());
});

// Test endpoints with professional responses
app.get('/test', (req: Request, res: Response) => {
  return sendResponse(res, {
    code: 200,
    message: req.t('welcome'),
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    },
  });
});

app.get('/test/:lang', (req: Request, res: Response) => {
  const langParam = req.params.lang;
  const lang = Array.isArray(langParam) ? langParam[0] : langParam;

  // Validate language parameter
  const supportedLanguages = ['en', 'bn'];
  if (!lang || !supportedLanguages.includes(lang)) {
    return sendErrorResponse(res, {
      code: 400,
      message: 'Unsupported language',
      errors: [{ path: 'lang', message: 'Unsupported language' }],
      meta: {
        supportedLanguages,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Change the language dynamically for the current request
  i18next.changeLanguage(lang);

  return sendResponse(res, {
    code: 200,
    message: req.t('welcome'),
    data: {
      language: lang,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    },
  });
});

// global error handle
app.use(globalErrorHandler);

// handle not found route
app.use(notFound);

export default app;
