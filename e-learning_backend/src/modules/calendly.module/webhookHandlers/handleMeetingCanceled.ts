import { MentorApprovalBookingService } from '../../booking.module/mentorApprovalBooking/mentorApprovalBooking.service';
import { Meeting } from '../meeting/meeting.model';

const mentorApprovalBookingService = new MentorApprovalBookingService();

const extractCalendlyUuid = (uri?: string | null) => uri?.split('/').pop() || null;

export async function handleInviteeCanceled(payload: any) {
  const eventId = extractCalendlyUuid(payload?.event?.uri);

  if (!eventId) {
    return;
  }

  const booking = await mentorApprovalBookingService.handleCalendlyCancellation(
    eventId,
  );

  if (booking) {
    return booking;
  }

  return Meeting.findOneAndUpdate(
    { calendlyEventId: eventId },
    { status: 'cancelled', cancelledAt: new Date() },
    { new: true },
  );
}
