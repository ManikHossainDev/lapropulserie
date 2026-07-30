/** Allowed query filters for notification list endpoints */
export const notificationFilters: string[] = ['receiverId', 'type', 'viewStatus'];

/**
 * Notification type enum.
 * Each value corresponds to a domain event that triggers a notification.
 */
export enum TNotificationType {
  purchasedAdminCapsule = 'purchasedAdminCapsule',
  purchasedJourney = 'purchasedJourney',
  withdrawal = 'withdrawal',
  rejectWithdrawal = 'rejectWithdrawal',
  payment = 'payment',
  system = 'system',
  newUser = 'newUser',
  review = 'review',
  sessionBooking = 'sessionBooking',
  subscriptionActivated = 'subscriptionActivated',
  subscriptionCancelled = 'subscriptionCancelled',
  trialEnding = 'trialEnding',
  mentorApproved = 'mentorApproved',
  mentorRejected = 'mentorRejected',
  journeyCompleted = 'journeyCompleted',
  capsuleCompleted = 'capsuleCompleted',
}