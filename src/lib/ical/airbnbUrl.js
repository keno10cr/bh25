/** True for an https Airbnb calendar export link. */
export function isAirbnbIcalUrl(value) {
  if (!value || typeof value !== "string") return false;
  let url;
  try {
    url = new URL(value.trim());
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  if (host !== "airbnb.com" && !host.endsWith(".airbnb.com")) return false;
  return url.pathname.toLowerCase().includes(".ics");
}
