//@ts-ignore
import colors from 'colors';
//@ts-ignore
import nodemailer from 'nodemailer';
import path from 'path';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';
import { config } from '../config';
import { emitEmailJob } from './emailEventEmitter';
import { User } from '../modules/user.module/user/user.model';

// Create Nodemailer transporter
const hasAuth = Boolean(config.smtp.username) && Boolean(config.smtp.password);

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: Number(config.smtp.port),
  secure: Number(config.smtp.port) === 465, // true for 465, false for other ports
  auth: hasAuth
    ? {
        user: config.smtp.username,
        pass: config.smtp.password,
      }
    : undefined,
});

// Verify transporter connection
if (config.environment !== 'test') {
  transporter
    .verify()
    .then(() => logger.info(colors.cyan('📧  Connected to email server')))
    .catch(err => {
      // Check if using MailHog (localhost with port 1025)
      if (config.smtp.host === 'localhost' && config.smtp.port === 1025) {
        logger.warn(
          'Unable to connect to MailHog. Make sure MailHog is running: docker-compose -f docker-compose.dev.yml up mailhog',
        );
      } else if (config.smtp.host === 'mailhog') {
        logger.warn(
          'Unable to connect to MailHog container. Make sure MailHog service is running in Docker.',
        );
      } else {
        logger.warn(
          'Unable to connect to email server. Make sure you have configured the SMTP options in .env',
        );
      }
    });
}

const renderEmailTemplate = async (templateName: string, data: Record<string, unknown>) => {
  const fs = await import('fs');
  const ejs = await import('ejs');
  
  const templatePath = path.join(__dirname, '..', 'views', 'email', `${templateName}.ejs`);
  const template = fs.readFileSync(templatePath, 'utf-8');
  
  return ejs.render(template, { ...data, appName: config.app.name });
};

// Function to send email
const sendEmail = async (values: ISendEmail) => {
  try {
    const info = await transporter.sendMail({
      from: `${config.smtp.emailFrom}`, // sender address
      to: values.to, // list of receivers
      subject: values.subject, // subject line
      html: values.html, // html body
    });
    logger.info('Mail sent successfully', info.accepted);
  } catch (error) {
    errorLogger.error('Email', error);
  }
};

const sendVerificationEmail = async (to: string, otp: string, name?: string) => {
  const subject = 'Vérifie ton adresse e-mail';
  const html = await renderEmailTemplate('otp', { otp, name, expiresInMinutes: 3 });

  emitEmailJob({ to, subject, html });
};

const sendResetPasswordEmail = async (to: string, otp: string, name?: string) => {
  const subject = 'Reset Your Password';
  const html = await renderEmailTemplate('password-reset-otp', { otp, name, expiresInMinutes: 10 });

  emitEmailJob({ to, subject, html });
};

const sendAdminOrSuperAdminCreationEmail = async (
  email: string,
  role: string,
  password: string,
  message?: string,
) => {
  const subject = `Congratulations! You are now an ${role}`;
  const html = await renderEmailTemplate('admin-creation', { email, role, password, name: email.split('@')[0], message });

  emitEmailJob({ to: email, subject, html });
};
const sendWelcomeEmail = async (to: string, password: string, name?: string) => {
  const subject = 'Welcome to the Platform!';
  const html = await renderEmailTemplate('welcome', { email: to, password, name: name || to.split('@')[0] });

  emitEmailJob({ to, subject, html });
};
const sendSupportMessageEmail = async (
  userEmail: string,
  userName: string,
  subject: string,
  message: string,
) => {
  const adminEmail = config.smtp.emailFrom;
  const html = await renderEmailTemplate('support-message', { userEmail, userName, subject, message });

  emitEmailJob({
    to: adminEmail || '',
    subject: `Support Request from ${userName}`,
    html,
  });
};

const sendMentorApprovalRequestEmail = async (
  mentorName: string,
  mentorEmail: string,
) => {
  const adminUrl = (config.admin.url || 'https://admin.lapropulserie.fr').replace(
    /\/$/,
    '',
  );
  const adminBookingUrl = `${adminUrl}/booking-list`;
  const html = await renderEmailTemplate('mentor-approval-request', {
    mentorName,
    mentorEmail,
    adminBookingUrl,
  });
  const subject = `Nouvelle demande de validation mentor — ${mentorName}`;

  const recipients = new Set<string>();
  if (config.admin.notifyEmail?.trim()) {
    recipients.add(config.admin.notifyEmail.trim().toLowerCase());
  }

  // Also notify every active admin account
  try {
    const admins = await User.find({
      role: 'admin',
      isDeleted: { $ne: true },
    })
      .select('email')
      .lean();
    for (const admin of admins) {
      if (admin?.email) recipients.add(String(admin.email).trim().toLowerCase());
    }
  } catch (error) {
    errorLogger.error('Failed to load admin emails for mentor approval', error);
  }

  if (!recipients.size) {
    logger.warn(
      'No ADMIN_NOTIFY_EMAIL / admin users found — mentor approval email skipped',
    );
    return;
  }

  for (const to of recipients) {
    emitEmailJob({ to, subject, html });
  }
};

const sendBilanSummaryEmail = async (input: {
  to: string;
  firstName?: string;
  title: string;
  summary: string;
  texts?: string[];
}) => {
  const clientBase = (config.client.url || 'http://localhost:8002').replace(
    /\/$/,
    '',
  );
  const summaryUrl = `${clientBase}/students/question-summary`;
  const html = await renderEmailTemplate('bilan-summary', {
    firstName: input.firstName || '',
    title: input.title,
    summary: input.summary,
    texts: input.texts || [],
    summaryUrl,
  });

  emitEmailJob({
    to: input.to,
    subject: 'Ta synthèse de bilan — La Propulserie',
    html,
  });
};

export {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendAdminOrSuperAdminCreationEmail,
  sendSupportMessageEmail,
  sendWelcomeEmail,
  sendMentorApprovalRequestEmail,
  sendBilanSummaryEmail,
};
