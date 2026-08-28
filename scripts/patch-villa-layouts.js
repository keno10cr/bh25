/**
 * Update property sleeping layouts, bathrooms, and room types in Sanity
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

function syncHouseRulesAreaRules(existingRules, villaId) {
  const rules = (Array.isArray(existingRules) ? existingRules : []).filter(
    (rule) => rule?.titleEn !== "Pets"
  );
  rules.push(buildPetsAreaRule(villaId));
  return rules;
}

const PRICING_BY_ID = {
  3: { baseGuestCount: 6, extraGuestFeePerNight: 35 },
  4: { baseGuestCount: 2, extraGuestFeePerNight: 25 },
  5: { baseGuestCount: 4, extraGuestFeePerNight: 30 },
  6: { baseGuestCount: 1, extraGuestFeePerNight: 30 },
  7: { baseGuestCount: 4, extraGuestFeePerNight: 30 },
  8: { baseGuestCount: 2, extraGuestFeePerNight: 30 },
  9: { baseGuestCount: 2, extraGuestFeePerNight: 25 },
  10: { baseGuestCount: 2, extraGuestFeePerNight: 30 },
  11: { baseGuestCount: 4, extraGuestFeePerNight: 30 },
  12: { baseGuestCount: 4, extraGuestFeePerNight: 35 },
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
      baseGuestCount: 2,
      extraGuestFeePerNight: 30,
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
        baseGuestCount: pricing.baseGuestCount,
        extraGuestFeePerNight: pricing.extraGuestFeePerNight,
        houseArrangements,
        amenities: amenityKeys(villa),
        petsMax: DEFAULT_PETS_MAX,
        houseRulesAreaRules: syncHouseRulesAreaRules(
          existing?.houseRulesAreaRules,
          villa.id
        ),
        houseRulesReview: {
          smokingEn: "No smoking inside. Outdoor areas only.",
          dogsEn: DEFAULT_PETS_REVIEW_EN,
          partiesEn: formatPartiesPolicy(villa.maxPeople),
          quietHoursEn: "Quiet hours from 10:00 PM to 8:00 AM.",
        },
      },
    });
    console.log(`Queued ${villa.name}`);
  }

  await transaction.commit({ autoGenerateArrayKeys: true });
  console.log("Villa sleeping layouts updated in Sanity.");
}

patch().catch((error) => {
  console.error(error);
  process.exit(1);
});
