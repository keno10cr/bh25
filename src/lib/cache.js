/**
 * Shared cache TTLs for the public site.
 *
 * Vercel Hobby bills ISR Write Units (~8 KB each) every time a revalidated
 * page is stored again. A 60s page TTL was regenerating marketing pages
 * dozens of times per hour and blew past the 200k monthly write limit.
 *
 * Content is Sanity driven and changes rarely, so one hour is enough for
 * pages. Exchange rates update once a day. Availability stays on dynamic
 * API routes with shorter CDN TTLs so calendars stay fresh without ISR.
 */

/** Public page / Sanity content ISR interval (1 hour). */
export const CONTENT_REVALIDATE_SECONDS = 3600;

/** BCCR / market USD→CRC rate (12 hours). */
export const EXCHANGE_RATE_REVALIDATE_SECONDS = 43200;

/** Public availability API CDN cache (15 minutes). */
export const AVAILABILITY_S_MAXAGE_SECONDS = 900;

/** Stale while revalidate window for availability APIs (30 minutes). */
export const AVAILABILITY_SWR_SECONDS = 1800;
