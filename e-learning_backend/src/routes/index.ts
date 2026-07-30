import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { UserRoutes } from '../modules/user.module/user/user.route';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { AttachmentRoutes } from '../modules/attachments/attachment.route';
import { QuestionRoute } from '../modules/question.module/question.route';
import { JourneyRoute } from '../modules/journey.module/journey/journey.route';
import { JourneyCapsuleRoute } from '../modules/journey.module/journey-capsule/journey-capsule.route';
import { JourneyModuleRoute } from '../modules/journey.module/journey-module/journey-module.route';
import { PurchasedJourneyRoute } from '../modules/journey.module/purchased-journey/purchased-journey.route';
import { StudentCapsuleTrackerRoute } from '../modules/journey.module/student-capsule-tracker/student-capsule-tracker.route';
import { LessonTrackerRoute as JourneyLessonTrackerRoute } from '../modules/journey.module/lesson-tracker/lesson-tracker.route';
import { JourneyProgressTrackerRoute } from '../modules/journey.module/journey-progress-tracker/journey-progress-tracker.route';
import { IndividualCapsuleCategoryRoute } from '../modules/individualCapsule.module/individual-capsule-category/individual-capsule-category.route';
import { IndividualCapsuleRoute } from '../modules/individualCapsule.module/individual-capsule/individual-capsule.route';
import { IndividualModuleRoute } from '../modules/individualCapsule.module/individual-module/individual-module.route';
import { IndividualLessonRoute } from '../modules/individualCapsule.module/individual-lesson/individual-lesson.route';
import { PurchasedIndividualCapsuleRoute } from '../modules/individualCapsule.module/purchased-individual-capsule/purchased-individual-capsule.route';
import { IndividualModuleProgressRoute } from '../modules/individualCapsule.module/individual-module-progress/individual-module-progress.route';
import { IndividualLessonProgressRoute } from '../modules/individualCapsule.module/individual-lesson-progress/individual-lesson-progress.route';
import { AdminDashboardRoute } from '../modules/individualCapsule.module/adminDashboard/adminDashboard.route';
import { IndividualCapsuleReviewRoute } from '../modules/individualCapsule.module/individual-capsule-review/individual-capsule-review.route';
import { LearnerAnswerRoute } from '../modules/individualCapsule.module/learner-answer/learner-answer.route';
import { MariiReportRoute } from '../modules/individualCapsule.module/marii-report/marii-report.route';
import { MentorProfileRoute } from '../modules/mentor.module/mentorProfile/mentorProfile.route';
import { MentorDashboardRoute } from '../modules/mentor.module/mentorProfile/mentorDashboard.route';
// import { MentorReviewRoute } from '../modules/review.module/mentorReview/mentorReview.route';
import { MentorApprovalBookingRoute } from '../modules/booking.module/mentorApprovalBooking/mentorApprovalBooking.route';
import { PaymentTransactionRoute } from '../modules/payment.module/paymentTransaction/paymentTransaction.route';
import { PaymentRoute } from '../modules/payment.module/payment/payment.route';
import { SubscriptionPlanRoute } from '../modules/payment.module/subscriptionPlan/subscriptionPlan.route';
import { UserSubscriptionRoute } from '../modules/payment.module/userSubscription/userSubscription.route';
import stripeAccountRoutes from '../modules/payment.module/stripeAccount/stripeAccount.route';
import { WalletTransactionHistoryRoute } from '../modules/wallet.module/walletTransactionHistory/walletTransactionHistory.route';
import { BankInfoRoute } from '../modules/wallet.module/bankInfo/bankInfo.route';
import { WithdrawalRequestRoute } from '../modules/wallet.module/withdrawalRequest/withdrawalRequest.route';
import { SettingsRoutes } from '../modules/settings.module/settings/settings.routes';
import { FaqCategoryRoute } from '../modules/settings.module/faqCategory/faqCategory.route';
import { FaqRoute } from '../modules/settings.module/faq/faq.route';
import { CalendlyRoute } from '../modules/calendly.module/calendly/calendly.route';
import { StudentDashboardRoute } from '../modules/student.module/student-dashboard/student-dashboard.route';
import { MentorsRoute } from '../modules/student.module/mentors/mentors.route';
import { VideoUploadRoute } from '../modules/video-upload/video-upload.route';
import { StudentJourneyRoute } from '../modules/journey.module/student-journey/student-journey.route';
import { LunaRoute } from '../modules/luna.module/luna.route';
import { RecommendFriendRoute } from '../modules/recommendFriend.module/recommendFriend.route';

const router = express.Router();

const apiRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/notifications', route: NotificationRoutes },
  { path: '/attachments', route: AttachmentRoutes },
  { path: '/activity', route: NotificationRoutes },
  { path: '/question-system', route: QuestionRoute },
  { path: '/student-dashboard', route: StudentDashboardRoute },
  { path: '/video-upload', route: VideoUploadRoute },

  { path: '/journey', route: JourneyRoute },
  { path: '/journey-capsule', route: JourneyCapsuleRoute },
  { path: '/journey-module', route: JourneyModuleRoute },
  { path: '/purchased-journey', route: PurchasedJourneyRoute },
  { path: '/student-capsule-trackers', route: StudentCapsuleTrackerRoute },
  { path: '/journey-lesson-tracker', route: JourneyLessonTrackerRoute },
  { path: '/journey-progress-tracker', route: JourneyProgressTrackerRoute },
  { path: '/student-journey', route: StudentJourneyRoute },

  { path: '/admin-dashboard', route: AdminDashboardRoute },
  {
    path: '/individual-capsule-category',
    route: IndividualCapsuleCategoryRoute,
  },
  { path: '/individual-capsule', route: IndividualCapsuleRoute },
  { path: '/individual-module', route: IndividualModuleRoute },
  { path: '/individual-lesson', route: IndividualLessonRoute },
  {
    path: '/purchased-individual-capsule',
    route: PurchasedIndividualCapsuleRoute,
  },
  { path: '/individual-module-progress', route: IndividualModuleProgressRoute },
  { path: '/individual-lesson-progress', route: IndividualLessonProgressRoute },
  { path: '/individual-capsule-reviews', route: IndividualCapsuleReviewRoute },
  { path: '/learner-answers', route: LearnerAnswerRoute },
  { path: '/marii-report', route: MariiReportRoute },
  { path: '/luna', route: LunaRoute },
  { path: '/recommend-friend', route: RecommendFriendRoute },

  { path: '/mentor-profiles', route: MentorProfileRoute },
  { path: '/mentor-dashboard', route: MentorDashboardRoute },
  { path: '/mentors', route: MentorsRoute },
  // { path: '/mentor-review', route: MentorReviewRoute },
  { path: '/mentor-approval-bookings', route: MentorApprovalBookingRoute },

  { path: '/payment-transactions', route: PaymentTransactionRoute },
  { path: '/payments', route: PaymentRoute },
  { path: '/payment-success', route: PaymentRoute },
  { path: '/payment-cancel', route: PaymentRoute },
  { path: '/subscription-plans', route: SubscriptionPlanRoute },
  { path: '/user-subscriptions', route: UserSubscriptionRoute },
  { path: '/ssl', route: stripeAccountRoutes },

  { path: '/wallet-transactions', route: WalletTransactionHistoryRoute },
  { path: '/withdrawal-request', route: WithdrawalRequestRoute },
  { path: '/bank-info', route: BankInfoRoute },

  { path: '/settings', route: SettingsRoutes },
  { path: '/faqCategory', route: FaqCategoryRoute },
  { path: '/faq', route: FaqRoute },

  { path: '/calendly', route: CalendlyRoute },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
