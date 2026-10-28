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

function replacePassengerPhrase(text, phrase) {
  return String(text || "")
    .replace(/up to\s+9\s+passengers/gi, phrase)
    .replace(/hasta\s+9\s+pasajeros/gi, phrase);
}

function ensurePerVan(text, phrase) {
  let next = replacePassengerPhrase(text, phrase);
  if (next.toLowerCase().includes(phrase.toLowerCase())) return next;
  next = next.replace(/\b9\s+passengers\b/i, phrase);
  next = next.replace(/\b9\s+pasajeros\b/i, phrase);
  return next;
}

function isAirportShuttle(activity) {
  const hay = `${activity?.slug || ""} ${activity?.translationKey || ""}`.toLowerCase();
  return hay.includes("airport") || hay.includes("staria");
}

export function applyTransportCopy(activity, copy) {
  if (!isAirportShuttle(activity)) return activity;
  const phrase = copy.perVan;
  let description = ensurePerVan(activity.displayDescription, phrase);
  if (!description.toLowerCase().includes(phrase.toLowerCase())) {
    const note = copy.perVanNote;
    description = description.trim() ? `${description.trim()} ${note}` : note;
  }
  return {
    ...activity,
    displayGroupSize: phrase,
    displayDescription: description,
    displayIncluded: (activity.displayIncluded || []).map((item) =>
      ensurePerVan(item, phrase)
    ),
  };
}

export function applyMealCopy(activity, count, copy) {
  if (!count) return activity;
  const label = `${count} ${copy.guestUnit}`;
  const sentence = copy.mealQuantity(count);
  const description = String(activity.displayDescription || "").trim();
  return {
    ...activity,
    displayGroupSize: label,
    displayDescription: description ? `${sentence} ${description}` : sentence,
  };
}
