/**
 * Update property pricing, sleeping layouts, bathrooms, and room types in Sanity
 * without re-uploading gallery images.
 *
 * Run: npm run patch:villa-layouts
 */
import { createClient } from "next-sanity";
import { STATIC_VILLAS } from "../src/data/villas.js";
import {
  DEFAULT_PETS_AREA_BODY_EN,
  DEFAULT_PETS_MAX,
  DEFAULT_PETS_REVIEW_EN,
  formatPartiesPolicy,
  textToPortableBlocks,
} from "../src/lib/houseRules.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";
import { ROOM_TYPES, VILLA_ARRANGEMENTS } from "./room-types-data.js";

function amenityKeys(villa) {
  const keys = [...(villa.amenities || [])];
  if (!keys.includes("sharedPool")) keys.push("sharedPool");
  return keys;
}

function buildPetsAreaRule(villaId) {
  return {
    _key: "pets",
    titleEn: "Pets",
    bodyEn: textToPortableBlocks(DEFAULT_PETS_AREA_BODY_EN, `pets-${villaId}`),
  };
}

function occupancyCopy(villa, pricing) {
  const included = pricing.baseGuestCount;
  const extra = pricing.extraGuestFeePerNight;
  const minNights = pricing.minimumNights || 2;
  return `This villa sleeps up to ${villa.maxPeople} guests. The nightly rate includes ${included} guest${included === 1 ? "" : "s"}. Each extra adult or child is $${extra} per night. Minimum stay is ${minNights} night${minNights === 1 ? "" : "s"} for online Reserve.`;
}

function syncHouseRulesAreaRules(existingRules, villa, pricing) {
  const rules = (Array.isArray(existingRules) ? existingRules : [])
    .filter((rule) => rule?.titleEn !== "Pets")
    .map((rule) => {
      if (rule?.titleEn !== "Occupancy and extra guests") return rule;
      return {
        ...rule,
        _key: rule._key || "occupancy",
        titleEn: "Occupancy and extra guests",
        bodyEn: textToPortableBlocks(
          occupancyCopy(villa, pricing),
          `occ-${villa.id}`
        ),
      };
    });

  if (!rules.some((rule) => rule?.titleEn === "Occupancy and extra guests")) {
    rules.push({
      _key: "occupancy",
      titleEn: "Occupancy and extra guests",
      bodyEn: textToPortableBlocks(
        occupancyCopy(villa, pricing),
        `occ-${villa.id}`
      ),
    });
  }

  rules.push(buildPetsAreaRule(villa.id));
  return rules;
}

/** Spreadsheet base = priceMin; priceMax ≈ 25% high season markup (rounded). */
const PRICING_BY_ID = {
  3: { priceMin: 280, priceMax: 350, baseGuestCount: 6, extraGuestFeePerNight: 30, minimumNights: 2 },
  4: { priceMin: 110, priceMax: 140, baseGuestCount: 2, extraGuestFeePerNight: 30, minimumNights: 2 },
  5: { priceMin: 190, priceMax: 240, baseGuestCount: 2, extraGuestFeePerNight: 30, minimumNights: 2 },
  6: { priceMin: 65, priceMax: 85, baseGuestCount: 1, extraGuestFeePerNight: 30, minimumNights: 2 },
  7: { priceMin: 190, priceMax: 240, baseGuestCount: 4, extraGuestFeePerNight: 30, minimumNights: 2 },
  8: { priceMin: 140, priceMax: 175, baseGuestCount: 2, extraGuestFeePerNight: 30, minimumNights: 2 },
  9: { priceMin: 120, priceMax: 150, baseGuestCount: 2, extraGuestFeePerNight: 30, minimumNights: 2 },
  10: { priceMin: 120, priceMax: 150, baseGuestCount: 2, extraGuestFeePerNight: 30, minimumNights: 2 },
  11: { priceMin: 180, priceMax: 225, baseGuestCount: 4, extraGuestFeePerNight: 30, minimumNights: 2 },
  12: { priceMin: 220, priceMax: 275, baseGuestCount: 4, extraGuestFeePerNight: 30, minimumNights: 2 },
};

async function getClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) {
    throw new Error("SANITY_API_WRITE_TOKEN is missing from .env.local");
  }
  return createClient({
    projectId: sanityProjectId,
    dataset: sanityDataset,
    apiVersion: sanityApiVersion,
    token,
    useCdn: false,
  });
}

async function patch() {
  const client = await getClient();
  const transaction = client.transaction();

  for (const room of ROOM_TYPES) {
    transaction.createOrReplace({
      _id: room.id,
      _type: "roomType",
      titleEn: room.titleEn,
      titleEs: room.titleEs,
      configEn: room.configEn,
      configEs: room.configEs,
      capacity: room.capacity,
      icon: room.icon,
    });
  }

  for (const villa of STATIC_VILLAS) {
    const propertyId = `property-${villa.slug}`;
    const existing = await client.fetch(
      `*[_id == $id][0]{houseRulesAreaRules}`,
      { id: propertyId }
    );
    const rows = VILLA_ARRANGEMENTS[villa.id] || [];
    const pricing = PRICING_BY_ID[villa.id] || {
      priceMin: 100,
      priceMax: 130,
      baseGuestCount: 2,
      extraGuestFeePerNight: 30,
      minimumNights: 2,
    };

    const houseArrangements = rows.map((row, index) => ({
      _type: "houseArrangementRow",
      _key: `arr${index}`,
      roomType: { _type: "reference", _ref: row.roomTypeId },
      quantity: row.quantity,
      customTitleEn: row.customTitleEn,
    }));

    transaction.patch(propertyId, {
      set: {
        bathrooms: villa.bathrooms,
        priceMin: pricing.priceMin,
        priceMax: pricing.priceMax,
        currency: "USD",
        minimumNights: pricing.minimumNights,
        baseGuestCount: pricing.baseGuestCount,
        extraGuestFeePerNight: pricing.extraGuestFeePerNight,
        houseArrangements,
        amenities: amenityKeys(villa),
        petsMax: DEFAULT_PETS_MAX,
        houseRulesAreaRules: syncHouseRulesAreaRules(
          existing?.houseRulesAreaRules,
          villa,
          pricing
        ),
        houseRulesReview: {
          smokingEn: "No smoking inside. Outdoor areas only.",
          dogsEn: DEFAULT_PETS_REVIEW_EN,
          partiesEn: formatPartiesPolicy(villa.maxPeople),
          quietHoursEn: "Quiet hours from 10:00 PM to 8:00 AM.",
        },
      },
    });
    console.log(
      `Queued ${villa.name}: $${pricing.priceMin}–$${pricing.priceMax}, ${pricing.baseGuestCount} included, +$${pricing.extraGuestFeePerNight}`
    );
  }

  await transaction.commit({ autoGenerateArrayKeys: true });
  console.log("Villa pricing and sleeping layouts updated in Sanity.");
}

patch().catch((error) => {
  console.error(error);
  process.exit(1);
});
