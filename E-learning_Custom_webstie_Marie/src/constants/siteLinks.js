/**
 * Marie / La Propulserie public Calendly (homepage CTAs).
 * Note: `/rdv` 404s — live event slug is currently `30min`.
 * Override at build time with NEXT_PUBLIC_CALENDLY_BOOKING_URL if the slug changes.
 */
export const MARIE_CALENDLY_BOOKING_URL =
  (typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_CALENDLY_BOOKING_URL?.trim()) ||
  'https://calendly.com/marie-bouleau-lapropulserie/30min';
