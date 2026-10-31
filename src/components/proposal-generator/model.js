import {
  isMealsActivity,
  isTransportActivity,
  splitProposalActivities,
} from "@/lib/activity-groups";

export function activityKey(activity) {
  return String(activity?.slug || activity?.id || "");
}

export function parseGroupCount(value) {
  const text = String(value ?? "").trim();
  if (!text) return { value: null, invalid: false };
  if (!/^\d+$/.test(text)) return { value: null, invalid: true };
  const number = Number(text);
  if (number < 1 || number > 999) return { value: null, invalid: true };
  return { value: number, invalid: false };
}

export function formatGroupSize(min, max, unit) {
  if (min && max) {
    if (min === max) return `${min} ${unit}`;
    const low = Math.min(min, max);
    const high = Math.max(min, max);
    return `${low}–${high} ${unit}`;
  }
  const single = min || max;
  return single ? `${single} ${unit}` : "";
}

export function mealHeadcount(min, max) {
  if (min && max) return Math.max(min, max);
  return max || min || null;
}

export function defaultSelectedKeys(activities) {
  const { transport, meals, local } = splitProposalActivities(activities);
  return [...transport, ...meals, ...local.slice(0, 8)]
    .map(activityKey)
    .filter(Boolean);
}

export function partitionProposalActivities(activities) {
  const transport = [];
  const meals = [];
  const local = [];
  for (const activity of activities) {
    if (isTransportActivity(activity)) transport.push(activity);
    else if (isMealsActivity(activity)) meals.push(activity);
    else local.push(activity);
  }
  return { transport, meals, local };
}

const SEAT_PHRASES = [
  [/seats up to\s+9\s+passengers/gi, "has 11 seats"],
  [/up to\s+9\s+passengers/gi, "11 seats"],
  [/9\s+passengers per van/gi, "11 seats per van"],
  [/\b9\s+passengers\b/gi, "11 seats"],
  [/lleva hasta\s+9\s+pasajeros/gi, "tiene 11 asientos"],
  [/hasta\s+9\s+pasajeros/gi, "11 asientos"],
  [/9\s+pasajeros por van/gi, "11 asientos por van"],
  [/\b9\s+pasajeros\b/gi, "11 asientos"],
];

function rewriteSeats(text) {
  return SEAT_PHRASES.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    String(text || "")
  );
}

function ensurePerVan(text, copy) {
  const next = rewriteSeats(text);
  const markers = ["11 seats", "11 asientos", copy.perVan];
  if (markers.some((marker) => next.toLowerCase().includes(marker.toLowerCase()))) {
    return next;
  }
  const note = copy.perVanNote;
  return next.trim() ? `${next.trim()} ${note}` : note;
}

function isAirportShuttle(activity) {
  const hay = `${activity?.slug || ""} ${activity?.translationKey || ""}`.toLowerCase();
  return hay.includes("airport") || hay.includes("staria");
}

export function applyTransportCopy(activity, copy) {
  if (!isAirportShuttle(activity)) return activity;
  return {
    ...activity,
    displayGroupSize: copy.perVan,
    displayDescription: ensurePerVan(activity.displayDescription, copy),
    displayIncluded: (activity.displayIncluded || []).map((item) =>
      rewriteSeats(item)
    ),
  };
}

export function applyMealCopy(activity, count, copy) {
  const titled = {
    ...activity,
    displayTitle: copy.mealsCardTitle || activity.displayTitle,
  };
  if (!count) return titled;
  const label = `${count} ${copy.guestUnit}`;
  const sentence = copy.mealQuantity(count);
  const description = String(activity.displayDescription || "").trim();
  return {
    ...titled,
    displayGroupSize: label,
    displayDescription: description ? `${sentence} ${description}` : sentence,
  };
}
