export const DEFAULT_PETS_MAX = 2;

export const DEFAULT_PETS_REVIEW_EN =
  "Pets welcome with prior notice. No pets in the pool or on beds; please bring their own pet bed. Clean up after your pet and do not leave them unattended in the villa.";

export const DEFAULT_PETS_AREA_BODY_EN =
  "Pets are welcome with prior notice.\n\nPets are not allowed in the pool. Pets are not allowed on beds or furniture. Please bring their own pet bed.\n\nClean up after your pet in the garden and shared paths. Do not leave pets unattended in the villa.\n\nPlease tell us how many pets you are bringing when you book.";

function textToBlocks(text, prefix = "rule") {
  return String(text || "")
    .split(/\n\n+/)
    .filter(Boolean)
    .map((paragraph, index) => ({
      _type: "block",
      _key: `${prefix}-${index}`,
      style: "normal",
      markDefs: [],
      children: [
        {
          _type: "span",
          _key: `${prefix}-s${index}`,
          text: paragraph,
          marks: [],
        },
      ],
    }));
}

export function isAntiPetCopy(text) {
  const lower = String(text || "").toLowerCase();
  return (
    lower.includes("not allowed") ||
    lower.includes("no pets") ||
    lower.includes("no dogs") ||
    lower.includes("no se permiten") ||
    lower.includes("no mascotas")
  );
}

export function isVaguePartiesCopy(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return true;
  return (
    /beyond\s+\d+\.?\s*$/i.test(trimmed) ||
    /extra guests beyond/i.test(trimmed) ||
    /beyond the approved guest count/i.test(trimmed)
  );
}

export function formatPartiesPolicy(guestsMax) {
  const max = Math.max(1, Math.floor(guestsMax || 1));
  return `No parties or events. Only up to ${max} registered guests may stay overnight.`;
}

export function resolvePetsMax(property) {
  const value = property?.petsMax ?? property?.guests?.petsMax;
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  return DEFAULT_PETS_MAX;
}

export function resolvePetsReview(cmsText, petsMax = DEFAULT_PETS_MAX) {
  const trimmed = String(cmsText || "").trim();
  if (petsMax <= 0) {
    return trimmed || "Pets are not allowed at this property.";
  }
  if (!trimmed || isAntiPetCopy(trimmed)) {
    return DEFAULT_PETS_REVIEW_EN;
  }
  return trimmed;
}

export function resolvePartiesReview(cmsText, guestsMax, translate) {
  const trimmed = String(cmsText || "").trim();
  if (!isVaguePartiesCopy(trimmed)) {
    return trimmed;
  }
  const localized =
    typeof translate === "function"
      ? translate("villas.houseRules.partiesPolicy")
      : "";
  if (localized && localized !== "villas.houseRules.partiesPolicy") {
    const max = Math.max(1, Math.floor(guestsMax || 1));
    return localized.replace(/\{max\}/g, String(max));
  }
  return formatPartiesPolicy(guestsMax);
}

export function getLocalizedHouseRules(property) {
  const rules = property?.houseRules;
  const petsMax = resolvePetsMax(property);
  const guestsMax = property?.guestsMax ?? property?.guests?.max ?? 1;
  const defaultDogs = resolvePetsReview(rules?.review?.dogsEn, petsMax);

  const areaRules =
    rules?.areaRules
      ?.map((rule) => ({
        title: rule.titleEn || rule.title,
        body: rule.bodyEn || rule.body || [],
      }))
      .filter((rule) => rule.title && Array.isArray(rule.body) && rule.body.length > 0) ||
    [];

  const reviewDefaults = {
    smoking:
      rules?.review?.smokingEn?.trim() ||
      "Smoking is not allowed inside the property.",
    dogs: defaultDogs,
    parties: resolvePartiesReview(rules?.review?.partiesEn, guestsMax),
    quietHours:
      rules?.review?.quietHoursEn?.trim() ||
      "Please respect quiet hours from 10:00 PM to 8:00 AM.",
  };

  if (areaRules.length > 0) {
    return {
      areaRules,
      review: reviewDefaults,
    };
  }

  return {
    areaRules: [
      {
        title: "Stay policy",
        body: textToBlocks(
          "Registered guests must respect the approved occupancy limit and follow the check in instructions shared before arrival."
        ),
      },
      {
        title: "Property care",
        body: textToBlocks(
          "Please help us keep the villa in excellent condition. Report any incident or damage as soon as it occurs."
        ),
      },
    ],
    review: reviewDefaults,
  };
}

export function getHouseRulesForDisplay(property, t) {
  const rules = getLocalizedHouseRules(property);
  const petsMax = resolvePetsMax(property);
  const guestsMax = property?.guestsMax ?? property?.guests?.max ?? 1;
  const translate = typeof t === "function" ? t : (key) => key;

  let dogs = rules.review.dogs;
  if (petsMax > 0 && dogs === DEFAULT_PETS_REVIEW_EN) {
    const localized = translate("villas.houseRules.petsPolicy");
    if (localized && localized !== "villas.houseRules.petsPolicy") {
      dogs = localized;
    }
  }

  return {
    areaRules: rules.areaRules,
    review: {
      smoking:
        rules.review.smoking || translate("villas.houseRules.smokingPolicy"),
      dogs,
      parties:
        rules.review.parties ||
        resolvePartiesReview(null, guestsMax, translate),
      quietHours:
        rules.review.quietHours ||
        translate("villas.houseRules.quietHoursPolicy"),
    },
  };
}

function portableTextToPlain(body) {
  if (!Array.isArray(body)) return "";
  return body
    .map((block) =>
      (block.children || [])
        .map((child) => child.text || "")
        .join("")
    )
    .join(" ");
}

function ensurePetsAreaBody(body) {
  const plain = portableTextToPlain(body).toLowerCase();
  if (
    !plain.includes("pet bed") &&
    !plain.includes("cama para mascota") &&
    !plain.includes("own bed")
  ) {
    return textToBlocks(DEFAULT_PETS_AREA_BODY_EN, "pets-fallback");
  }
  return body;
}

export function hasPetsAreaRule(areaRules) {
  return (areaRules || []).some(
    (rule) => String(rule?.title || "").trim().toLowerCase() === "pets"
  );
}

/** Flat rule cards: area rules (Pets last), then Smoking, Parties, Quiet hours. */
export function getOrderedHouseRuleCards(property, t) {
  const display = getHouseRulesForDisplay(property, t);
  const translate = typeof t === "function" ? t : (key) => key;
  const petsMax = resolvePetsMax(property);

  const petsAreaRule = display.areaRules.find(
    (rule) => String(rule.title || "").trim().toLowerCase() === "pets"
  );
  const otherAreaRules = display.areaRules.filter(
    (rule) => String(rule.title || "").trim().toLowerCase() !== "pets"
  );

  const cards = otherAreaRules.map((rule) => ({
    key: `area-${rule.title}`,
    title: rule.title,
    body: rule.body,
  }));

  cards.push(
    {
      key: "smoking",
      title: translate("checkout.smoking"),
      body: textToBlocks(display.review.smoking, "smoking"),
    },
    {
      key: "parties",
      title: translate("checkout.parties"),
      body: textToBlocks(display.review.parties, "parties"),
    },
    {
      key: "quietHours",
      title: translate("checkout.quietHours"),
      body: textToBlocks(display.review.quietHours, "quiet"),
    }
  );

  if (petsAreaRule) {
    cards.push({
      key: "pets",
      title: petsAreaRule.title,
      body: ensurePetsAreaBody(petsAreaRule.body),
    });
  } else if (petsMax > 0) {
    cards.push({
      key: "pets",
      title: translate("checkout.pets"),
      body: textToBlocks(display.review.dogs, "pets"),
    });
  }

  return cards;
}

export function textToPortableBlocks(text, prefix = "rule") {
  return textToBlocks(text, prefix);
}
