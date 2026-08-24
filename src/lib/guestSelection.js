export const EMPTY_GUEST_SELECTION = {
  adults: 0,
  children: 0,
  pets: 0,
};

function sanitizeCount(value) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? parseInt(value, 10)
        : 0;
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(99, Math.floor(parsed));
}

export function sanitizeGuestCount(value) {
  return sanitizeCount(value);
}

export function normalizeGuestSelection(value) {
  let adults = sanitizeCount(value?.adults);
  let children = sanitizeCount(value?.children);
  let pets = sanitizeCount(value?.pets);
  if (adults === 0 && (children > 0 || pets > 0)) {
    children = 0;
    pets = 0;
  }
  return { adults, children, pets };
}

export function parseGuestSelection(value = {}) {
  const parsed = {
    adults: sanitizeCount(value.adults),
    children: sanitizeCount(value.children),
    pets: sanitizeCount(value.pets),
  };
  if (parsed.adults || parsed.children || parsed.pets) {
    return normalizeGuestSelection(parsed);
  }
  return normalizeGuestSelection({
    adults: sanitizeCount(value.guests),
    children: 0,
    pets: 0,
  });
}

export function getTotalHumanGuests(selection) {
  return selection.adults + selection.children;
}

export function formatGuestSelectionSummary(selection) {
  const normalized = normalizeGuestSelection(selection);
  const parts = [];
  if (normalized.adults) {
    parts.push(
      `${normalized.adults} ${normalized.adults === 1 ? "Adult" : "Adults"}`
    );
  }
  if (normalized.children) {
    parts.push(
      `${normalized.children} ${normalized.children === 1 ? "Child" : "Children"}`
    );
  }
  if (normalized.pets) {
    parts.push(
      `${normalized.pets} ${normalized.pets === 1 ? "Pet" : "Pets"}`
    );
  }
  return parts.join(", ") || "Select guests";
}

export function clampGuestSelection(selection, maxHumans, petsMax = 0) {
  const n = normalizeGuestSelection(selection);
  const humanCap = Math.max(1, Math.floor(maxHumans || 1));
  let adults = Math.min(Math.max(1, n.adults || 1), humanCap);
  let children = Math.min(n.children, Math.max(0, humanCap - adults));
  while (adults + children > humanCap && children > 0) children -= 1;
  while (adults + children > humanCap && adults > 1) adults -= 1;
  const pets = Math.min(n.pets, Math.max(0, petsMax));
  return normalizeGuestSelection({ adults, children, pets });
}
