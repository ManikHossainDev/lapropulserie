import { TRole } from '../../../middlewares/roles';
import { enqueueWebNotification } from '../../../services/notification.service';
import { TNotificationType } from '../../notification/notification.constants';
import { IMeeting } from '../meeting/meeting.interface';
import { Meeting } from '../meeting/meeting.model';
import { MentorApprovalBookingService } from '../../booking.module/mentorApprovalBooking/mentorApprovalBooking.service';

const mentorApprovalBookingService = new MentorApprovalBookingService();

const extractCalendlyUuid = (uri?: string | null) => uri?.split('/').pop() || null;

export async function handleInviteeCreated(user: any, payload: any) {
  const { uri: inviteeUri, email, name, scheduled_event: scheduledEvent } =
    payload.invitee;

  const inviteeId = extractCalendlyUuid(inviteeUri);
  const eventId = extractCalendlyUuid(scheduledEvent?.uri);

  if (!inviteeId || !eventId) {
    return;
  }

  if (user.role === TRole.admin) {
    await mentorApprovalBookingService.markInterviewScheduledFromCalendly({
      mentorEmail: email,
      eventId,
      inviteeId,
      eventUri: scheduledEvent?.uri,
      inviteeUri,
      cancelUrl: payload.invitee?.cancel_url,
      rescheduleUrl: payload.invitee?.reschedule_url,
      scheduledAt: new Date(scheduledEvent.start_time),
      inviteeName: name,
    });
    return;
  }

  const meeting: IMeeting = await Meeting.findOneAndUpdate(
    { calendlyEventId: eventId },
    {
      calendlyEventId: eventId,
      calendlyInviteeId: inviteeId,
      mentorId: user._id,
      studentEmail: email,
      studentName: name,
      eventType: payload.event_type?.name || 'Session',
      scheduledAt: new Date(scheduledEvent.start_time),
      duration: scheduledEvent.duration,
      location: scheduledEvent.location?.type || 'virtual',
      status: 'scheduled',
      rawPayload: payload,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  await enqueueWebNotification(
    `Student ${name} booked a session at ${meeting.scheduledAt}`,
    '' as any,
    user._id,
    TRole.mentor,
    TNotificationType.sessionBooking,
    meeting._id as any,
    '' as any,
    '' as any,
  );
}
