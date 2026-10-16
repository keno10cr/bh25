export const TOOL_COOKIE = "bh_tool_session";
export const TOOL_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
export const TOOL_PATHS = ["/bhgr", "/ccen", "/cces"];

const encoder = new TextEncoder();

function toolPass() {
  return process.env.BH_TOOL_PASS || "";
}

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function isToolGateConfigured() {
  return toolPass().length > 0;
}

/** Session value derived from the password, so changing BH_TOOL_PASS signs everyone out. */
export async function createToolSessionToken() {
  if (!isToolGateConfigured()) return "";
  return hmacHex(toolPass(), "bh-tool-session-v1");
}

export async function isValidToolSession(token) {
  if (!token || !isToolGateConfigured()) return false;
  return safeEqual(token, await createToolSessionToken());
}

export async function isValidToolPassword(password) {
  if (typeof password !== "string" || !isToolGateConfigured()) return false;
  const [given, expected] = await Promise.all([
    hmacHex("bh-tool-compare", password),
    hmacHex("bh-tool-compare", toolPass()),
  ]);
  return safeEqual(given, expected);
}

/** Accepts the session cookie, or the password in the x-bh-tool-pass header for scripts. */
export async function isToolRequestAuthorized(request) {
  if (await isValidToolSession(request.cookies.get(TOOL_COOKIE)?.value)) return true;
  const headerPass = request.headers.get("x-bh-tool-pass");
  return headerPass ? isValidToolPassword(headerPass) : false;
}
