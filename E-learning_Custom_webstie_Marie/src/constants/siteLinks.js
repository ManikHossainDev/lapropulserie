/**
 * Marie / La Propulserie public Calendly (homepage CTAs).
 * Confirmed live event slug: `_rdv` (underscore). Plain `/rdv` is not a valid event.
 * Override at build time with NEXT_PUBLIC_CALENDLY_BOOKING_URL if the slug changes.
 */
export const MARIE_CALENDLY_BOOKING_URL =
  (typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL?.trim()) ||
  'https://calendly.com/marie-bouleau-lapropulserie/_rdv';
