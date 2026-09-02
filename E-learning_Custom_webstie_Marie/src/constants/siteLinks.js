/**
 * Marie / La Propulserie public Calendly (homepage CTAs).
 * Event slug: `rdv` — activate this event type in Calendly before go-live.
 * Override at build time with NEXT_PUBLIC_CALENDLY_BOOKING_URL if the slug changes.
 */
export const MARIE_CALENDLY_BOOKING_URL =
  (typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL?.trim()) ||
  'https://calendly.com/marie-bouleau-lapropulserie/rdv';
