import { timingSafeEqual } from "node:crypto";

export const SOCIAL_SECRET_HEADER = "x-social-secret";

function readProvidedSecret(request) {
  const header = request.headers.get(SOCIAL_SECRET_HEADER);
  if (header) return header.trim();

  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return String(request.nextUrl.searchParams.get("secret") || "").trim();
}

function secretsMatch(provided, expected) {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Preview and pack routes stay hidden in production unless the caller
 * sends SOCIAL_PREVIEW_SECRET via x-social-secret, Bearer, or ?secret=.
 * Local development stays open so /test-social keeps working.
 */
export function socialRequestAllowed(request) {
  const expected = String(process.env.SOCIAL_PREVIEW_SECRET || "").trim();
  const provided = readProvidedSecret(request);

  if (provided) return secretsMatch(provided, expected);
  if (process.env.NODE_ENV !== "production") return true;
  return false;
}

export function socialSecretFromRequest(request) {
  const expected = String(process.env.SOCIAL_PREVIEW_SECRET || "").trim();
  const provided = readProvidedSecret(request);
  if (provided && secretsMatch(provided, expected)) return expected;
  return "";
}

export function socialPageSecretAllowed(provided) {
  if (process.env.NODE_ENV !== "production") return true;
  const expected = String(process.env.SOCIAL_PREVIEW_SECRET || "").trim();
  return secretsMatch(String(provided || "").trim(), expected);
}

export function requestOrigin(request) {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "http";
  return host ? `${proto}://${host}` : request.nextUrl.origin;
}
