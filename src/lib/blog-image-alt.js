/**
 * Featured and inline blog image alt text.
 * Editors can set a custom alt in Sanity. Otherwise we build one from
 * the post title, category, and a location phrase.
 */

const CATEGORY_PHRASE = {
  Flora: "flora from Puerto Viejo, Costa Rica",
  Fauna: "wildlife from Puerto Viejo, Costa Rica",
  "Local Spot": "a local spot near Puerto Viejo, Costa Rica",
  Retreats: "Blessed House in Puerto Viejo, Costa Rica",
  "National Parks": "a Costa Rica national park near the Caribbean",
};

const SLUG_OVERRIDES = {
  "how-to-get-to-punta-mona":
    "Coastal rainforest trail toward Punta Mona near Manzanillo, Costa Rica",
};

function cleanAlt(value) {
  return String(value || "")
    .replace(/[\u2013\u2014]/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

export function blogImageAlt({
  alt,
  title,
  category,
  slug,
  kind = "photo",
} = {}) {
  const custom = cleanAlt(alt);
  if (custom) return custom;

  const override = SLUG_OVERRIDES[slug];
  if (override) return override;

  const postTitle = cleanAlt(title);
  const context = CATEGORY_PHRASE[category] || "Puerto Viejo, Costa Rica";

  if (postTitle) {
    return `${postTitle}, ${kind} of ${context}`;
  }

  return `Blessed House blog ${kind} from Puerto Viejo, Costa Rica`;
}
