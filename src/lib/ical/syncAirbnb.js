import { addIsoDays, todayIsoDate } from "../availabilityDates";
import { websiteOccupiedRanges } from "../inventory";
import { createSanityServerClient } from "../sanity/client";
import { isAirbnbIcalUrl } from "./airbnbUrl";
import {
  AIRBNB_FETCH_CONCURRENCY,
  AIRBNB_SYNC_TTL_MS,
  airbnbBlockId,
  airbnbBlockTitle,
  SYNC_FETCH_TIMEOUT_MS,
  SYNC_PAGE_WAIT_MS,
} from "./constants";
import { blocksFromIcs, withoutMatchingRanges } from "./parseIcs";

const PROPERTIES_QUERY = `
*[_type == "property" && !(_id in path("drafts.**")) && ($propertyId == "" || _id == $propertyId)]{
  _id,
  "slug": slug.current,
  airbnbIcalUrl,
  airbnbIcalSyncedAt
}
`;

const EXISTING_AIRBNB_BLOCKS_QUERY = `
*[_type == "blockedDate" && source == "airbnb" && property._ref == $propertyId && !(_id in path("drafts.**"))]{
  _id,
  title,
  startDate,
  endDate,
  externalUid
}
`;

const WEBSITE_RANGES_QUERY = `{
  "blocked": *[_type == "blockedDate" && property._ref == $propertyId && source != "airbnb" && !(_id in path("drafts.**"))]{
    startDate,
    endDate,
    source
  },
  "paid": *[_type == "stayBooking" && property._ref == $propertyId && paymentStatus == "paid" && !(_id in path("drafts.**"))]{
    checkIn,
    checkOut
  }
}`;

const inflight = new Map();
let warnedMissingToken = false;

function isFresh(syncedAt, now = Date.now()) {
  const time = Date.parse(syncedAt || "");
  if (!Number.isFinite(time)) return false;
  return now - time < AIRBNB_SYNC_TTL_MS;
}

async function mapPool(items, limit, worker) {
  if (!items.length) return [];
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index]);
    }
  }
  const size = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: size }, () => run()));
  return results;
}

function isSafeHttpsUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    host === "0.0.0.0" ||
    host === "::1"
  ) {
    return false;
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    const [a, b] = host.split(".").map(Number);
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return false;
    }
  }
  return true;
}

async function fetchAirbnbIcs(url) {
  let current = url;
  for (let hop = 0; hop < 3; hop += 1) {
    const allowed = hop === 0 ? isAirbnbIcalUrl(current) : isSafeHttpsUrl(current);
    if (!allowed) {
      throw new Error("Airbnb calendar link is not an https airbnb.com .ics URL");
    }
    const response = await fetch(current, {
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(SYNC_FETCH_TIMEOUT_MS),
      headers: {
        Accept: "text/calendar, text/plain, */*",
        "User-Agent":
          "Mozilla/5.0 (compatible; BlessedHouseCalendarSync/1.0; +https://www.blessedhouse.info)",
      },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Airbnb calendar redirect had no location");
      current = new URL(location, current).toString();
      continue;
    }
    if (!response.ok) {
      throw new Error(`Airbnb calendar request failed (${response.status})`);
    }
    const text = await response.text();
    if (text.length > 2_000_000) throw new Error("Airbnb calendar is too large");
    if (!text.includes("BEGIN:VCALENDAR")) {
      throw new Error("Airbnb calendar was not an iCal feed");
    }
    return text;
  }
  throw new Error("Airbnb calendar redirected too many times");
}

async function clearAirbnbBlocks(client, propertyId) {
  const existing = await client.fetch(EXISTING_AIRBNB_BLOCKS_QUERY, { propertyId });
  const tx = client.transaction();
  for (const doc of existing || []) tx.delete(doc._id);
  tx.patch(propertyId, (patch) => patch.unset(["airbnbIcalSyncedAt"]));
  await tx.commit();
  return (existing || []).length;
}

async function storeAirbnbBlocks(client, propertyId, blocks) {
  const existing = await client.fetch(EXISTING_AIRBNB_BLOCKS_QUERY, { propertyId });
  const existingById = new Map((existing || []).map((doc) => [doc._id, doc]));
  const nextIds = new Set();
  const tx = client.transaction();
  let changed = 0;

  for (const block of blocks) {
    const _id = airbnbBlockId(propertyId, block.uid);
    nextIds.add(_id);
    const title = airbnbBlockTitle(block.summary);
    const current = existingById.get(_id);
    if (
      current &&
      current.startDate === block.startDate &&
      current.endDate === block.endDate &&
      current.title === title &&
      current.externalUid === block.uid
    ) {
      continue;
    }
    tx.createOrReplace({
      _id,
      _type: "blockedDate",
      title,
      startDate: block.startDate,
      endDate: block.endDate,
      property: { _type: "reference", _ref: propertyId },
      reason: "external",
      source: "airbnb",
      externalUid: block.uid,
    });
    changed += 1;
  }

  for (const doc of existing || []) {
    if (nextIds.has(doc._id)) continue;
    tx.delete(doc._id);
    changed += 1;
  }

  tx.patch(propertyId, (patch) =>
    patch.set({ airbnbIcalSyncedAt: new Date().toISOString() })
  );
  await tx.commit();
  return changed;
}

async function syncProperty(client, property) {
  const label = property.slug || property._id;
  if (!isAirbnbIcalUrl(property.airbnbIcalUrl)) {
    const removed = await clearAirbnbBlocks(client, property._id);
    return { slug: label, cleared: true, removed };
  }

  const ics = await fetchAirbnbIcs(property.airbnbIcalUrl.trim());
  const earliestIso = addIsoDays(todayIsoDate(), -1);
  let blocks = blocksFromIcs(ics, { earliestIso });
  const ranges = await client.fetch(WEBSITE_RANGES_QUERY, {
    propertyId: property._id,
  });
  blocks = withoutMatchingRanges(
    blocks,
    websiteOccupiedRanges(ranges?.blocked, ranges?.paid)
  ).slice(0, 500);

  const changed = await storeAirbnbBlocks(client, property._id, blocks);
  return { slug: label, refreshed: true, blocks: blocks.length, changed };
}

async function syncAirbnbCalendars({ propertyId = "", force = false } = {}) {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    if (!warnedMissingToken) {
      warnedMissingToken = true;
      console.warn("[ical] SANITY_API_WRITE_TOKEN missing; Airbnb blocks were not refreshed.");
    }
    return { ok: false, skipped: "missing-token" };
  }

  const client = createSanityServerClient();
  const properties = await client.fetch(PROPERTIES_QUERY, { propertyId });
  const list = properties || [];
  const due = list.filter((property) => {
    const hasUrl = isAirbnbIcalUrl(property.airbnbIcalUrl);
    if (!hasUrl) return Boolean(property.airbnbIcalSyncedAt);
    if (force) return true;
    return !isFresh(property.airbnbIcalSyncedAt);
  });

  if (!due.length) {
    return { ok: true, checked: list.length, refreshed: 0, errors: [] };
  }

  const errors = [];
  const results = await mapPool(due, AIRBNB_FETCH_CONCURRENCY, async (property) => {
    try {
      return await syncProperty(client, property);
    } catch (error) {
      const slug = property.slug || property._id;
      console.error(`[ical] ${slug} sync failed: ${error?.message || "unknown error"}`);
      errors.push(slug);
      return null;
    }
  });

  return {
    ok: errors.length === 0,
    checked: list.length,
    refreshed: results.filter((result) => result?.refreshed).length,
    cleared: results.filter((result) => result?.cleared).length,
    errors,
  };
}

function startSync(options) {
  const key = `${options.propertyId || "all"}:${options.force ? "force" : "ttl"}`;
  const current = inflight.get(key);
  if (current) return current;
  const job = syncAirbnbCalendars(options).catch((error) => {
    console.error("[ical] sync failed", error?.message || error);
    return { ok: false, error: "sync failed" };
  });
  inflight.set(key, job);
  job.finally(() => {
    if (inflight.get(key) === job) inflight.delete(key);
  });
  return job;
}

function withTimeout(job) {
  return Promise.race([
    job,
    new Promise((resolve) => {
      setTimeout(() => resolve({ ok: true, timedOut: true }), SYNC_PAGE_WAIT_MS);
    }),
  ]);
}

/**
 * Pull Airbnb calendars into blockedDate documents.
 * Page loads wait up to 20 seconds. Cron passes force and waits for the full run.
 * A failed fetch keeps the previous Airbnb blocks.
 */
export function ensureAirbnbCalendarsFresh(options = {}) {
  const job = startSync(options);
  if (options.force) return job;
  return withTimeout(job);
}
