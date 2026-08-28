/**
 * Seeds booking foundation docs:
 * - System Settings (13% tax, 9% service fee)
 * - Location: Blessed House
 * - Property kind: Villa
 * - Room types library
 * - 10 properties (one per Blessed House villa)
 *
 * Why Studio "Properties" was empty before:
 * We added the `property` schema, but never created documents.
 * Studio lists Sanity documents of type `property`, not the static
 * `src/data/villas.js` marketing fallbacks or legacy `villa` docs.
 *
 * Run: npm run seed:properties
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "next-sanity";
import { STATIC_VILLAS } from "../src/data/villas.js";
import { translations } from "../src/lib/translations.js";
import {
  sanityApiVersion,
  sanityDataset,
  sanityProjectId,
} from "../sanity/env.js";

import {
  ROOM_TYPES,
  VILLA_ARRANGEMENTS,
} from "./room-types-data.js";
import {
  DEFAULT_PETS_AREA_BODY_EN,
  DEFAULT_PETS_MAX,
  DEFAULT_PETS_REVIEW_EN,
  formatPartiesPolicy,
  textToPortableBlocks,
} from "../src/lib/houseRules.js";

const en = translations.en;
const BH_COORDS = { lat: 9.64735, lng: -82.77697 };
const imageCache = new Map();

const PRICING_BY_ID = {
  3: { priceMin: 250, priceMax: 350, baseGuestCount: 6, extraGuestFeePerNight: 35, minimumNights: 2 },
  4: { priceMin: 90, priceMax: 130, baseGuestCount: 2, extraGuestFeePerNight: 25, minimumNights: 2 },
  5: { priceMin: 160, priceMax: 220, baseGuestCount: 4, extraGuestFeePerNight: 30, minimumNights: 2 },
  6: { priceMin: 80, priceMax: 110, baseGuestCount: 1, extraGuestFeePerNight: 30, minimumNights: 2 },
  7: { priceMin: 150, priceMax: 200, baseGuestCount: 4, extraGuestFeePerNight: 30, minimumNights: 2 },
  8: { priceMin: 120, priceMax: 170, baseGuestCount: 2, extraGuestFeePerNight: 30, minimumNights: 2 },
  9: { priceMin: 90, priceMax: 130, baseGuestCount: 2, extraGuestFeePerNight: 25, minimumNights: 2 },
  10: { priceMin: 100, priceMax: 150, baseGuestCount: 2, extraGuestFeePerNight: 30, minimumNights: 2 },
  11: { priceMin: 150, priceMax: 210, baseGuestCount: 4, extraGuestFeePerNight: 30, minimumNights: 2 },
  12: { priceMin: 200, priceMax: 280, baseGuestCount: 4, extraGuestFeePerNight: 35, minimumNights: 2 },
};

function arrangementsForVilla(villa) {
  if (VILLA_ARRANGEMENTS[villa.id]) {
    return VILLA_ARRANGEMENTS[villa.id];
  }

  const beds = villa.bedrooms || 1;
  const max = villa.maxPeople || 2;
  const rows = [];

  if (beds >= 1) rows.push({ roomTypeId: "roomType-masterKing", quantity: 1 });
  if (beds >= 2) rows.push({ roomTypeId: "roomType-queenBedroom", quantity: 1 });
  if (beds >= 3) {
    rows.push({ roomTypeId: "roomType-twinBedroom", quantity: beds - 2 });
  }
  if (beds === 1 && max > 2) {
    rows.push({ roomTypeId: "roomType-guestSofa", quantity: 1 });
  }
  if (beds >= 4) rows.push({ roomTypeId: "roomType-bunkRoom", quantity: 1 });

  let capacity = 0;
  for (const row of rows) {
    const rt = ROOM_TYPES.find((item) => item.id === row.roomTypeId);
    capacity += (rt?.capacity || 0) * row.quantity;
  }
  if (capacity < max) {
    rows.push({
      roomTypeId: "roomType-guestSofa",
      quantity: 1,
      customTitleEn: "Extra sleeping space",
    });
  }
  return rows;
}

function toBlocks(text, prefix) {
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

function publicFile(relative) {
  return path.join(process.cwd(), "public", String(relative || "").replace(/^\//, ""));
}

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

async function uploadImage(client, relativePath) {
  if (!relativePath) return undefined;
  if (imageCache.has(relativePath)) return imageCache.get(relativePath);
  const filePath = publicFile(relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`Skipping missing image: ${relativePath}`);
    imageCache.set(relativePath, undefined);
    return undefined;
  }
  const buffer = fs.readFileSync(filePath);
  const asset = await client.assets.upload("image", buffer, {
    filename: path.basename(filePath),
  });
  const image = {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
  imageCache.set(relativePath, image);
  return image;
}

function amenityKeys(villa) {
  const keys = [...(villa.amenities || [])];
  if (!keys.includes("sharedPool")) keys.push("sharedPool");
  return keys;
}


async function deleteIfExists(client, id) {
  try {
    await client.delete(id);
    console.log(`Deleted legacy id: ${id}`);
  } catch (error) {
    // Ignore missing docs.
  }
}

async function upsert(client, doc) {
  await client.createOrReplace(doc);
  console.log(`Upserted ${doc._type}: ${doc._id}`);
}

/** Paid test stays that block villa calendars in /api/availability. */
async function seedTestBookings(client) {
  const testBookings = [
    {
      _id: "stayBooking-test-villa6-apr2027",
      propertyId: "property-villa-6-rana-roja",
      checkIn: "2027-04-04",
      checkOut: "2027-04-11",
      nights: 7,
      guestCount: 2,
      guestName: "Test Guest Villa 6",
      guestEmail: "test-villa6@blessedhouse.info",
      confirmationCode: "BH-TEST-V6",
      notes: "Seeded test stay: Sunday Apr 4 to Sunday Apr 11, 2027 (2 guests).",
    },
    {
      _id: "stayBooking-test-villa3-winter2026",
      propertyId: "property-villa-3-baula-turtle",
      checkIn: "2026-12-15",
      checkOut: "2027-01-07",
      nights: 23,
      guestCount: 2,
      guestName: "Test Guest Villa 3",
      guestEmail: "test-villa3@blessedhouse.info",
      confirmationCode: "BH-TEST-V3",
      notes: "Seeded test stay: Dec 15, 2026 to Jan 7, 2027 (2 guests).",
    },
  ];

  for (const booking of testBookings) {
    await upsert(client, {
      _id: booking._id,
      _type: "stayBooking",
      confirmationCode: booking.confirmationCode,
      property: { _type: "reference", _ref: booking.propertyId },
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guestCount: booking.guestCount,
      petsCount: 0,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: "+506 8888 0000",
      pricing: {
        currency: "USD",
        nightlySubtotal: 0,
        extraGuestFees: 0,
        feesTotal: 0,
        serviceFee: 0,
        tax: 0,
        total: 0,
      },
      paymentStatus: "paid",
      paymentProvider: "manual",
      source: "manual",
      notes: booking.notes,
    });
  }
}

async function seed() {
  const client = await getClient();

  // Public dataset ACL only grants read on single-segment IDs (path("*")),
  // so dotted IDs like property.villa-8 are invisible to the website.
  const legacyIds = [
    "location.blessedHouse",
    "propertyKind.villa",
    "roomType.masterKing",
    "roomType.queenBedroom",
    "roomType.twinBedroom",
    "roomType.guestSofa",
    "roomType.bunkRoom",
    ...STATIC_VILLAS.map((villa) => `property.${villa.slug}`),
  ];
  for (const id of legacyIds) {
    await deleteIfExists(client, id);
  }


  await upsert(client, {
    _id: "systemSettings",
    _type: "systemSettings",
    taxRate: 13,
    taxLabelEn: "Tax",
    currency: "USD",
    paymentsEnabled: false,
    paymentProviders: ["stripe"],
    checkoutFeeCatalog: [
      {
        _key: "cleaning-fee",
        feeId: "cleaning-fee",
        title: "Cleaning fee",
        titleEs: "Tarifa de limpieza",
        feeType: "percentage",
        amount: 9,
        application: "perStay",
      },
    ],
    listingTagCatalog: [
      {
        _key: "newListing",
        tagId: "new-listing",
        labelEn: "New listing",
        labelEs: "Nuevo listado",
        backgroundColor: "#0a4c3a",
        textColor: "#ffffff",
        tagCode: "NL",
      },
    ],
    careersLocationCatalog: [
      {
        _key: "bhPv",
        locationId: "blessed-house-pv",
        labelEn: "Blessed House, Puerto Viejo",
        labelEs: "Blessed House, Puerto Viejo",
        coordinates: {
          _type: "geopoint",
          lat: BH_COORDS.lat,
          lng: BH_COORDS.lng,
        },
      },
    ],
    jobListingTagCatalog: [
      {
        _key: "urgent",
        tagId: "urgent",
        labelEn: "Urgent",
        labelEs: "Urgente",
        backgroundColor: "#9a3412",
        textColor: "#ffffff",
      },
    ],
  });

  await upsert(client, {
    _id: "location-blessedHouse",
    _type: "location",
    label_en: "Blessed House",
    label_es: "Blessed House",
    footerDisplay: true,
  });

  await upsert(client, {
    _id: "propertyKind-villa",
    _type: "propertyKind",
    titleEn: "Villa",
    titleEs: "Villa",
  });

  for (const room of ROOM_TYPES) {
    await upsert(client, {
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
    const pricing = PRICING_BY_ID[villa.id] || {
      priceMin: 100,
      priceMax: 150,
      baseGuestCount: 2,
      extraGuestFeePerNight: 30,
      minimumNights: 2,
    };
    const copy = en.villas?.[villa.translationKey] || {};
    const description =
      copy.description ||
      `${villa.name} at Blessed House near Puerto Viejo, Costa Rica.`;
    const shortDescription = description.slice(0, 220);
    const heroImage = await uploadImage(client, villa.image);
    const gallery = [];
    for (const src of (villa.galleryImages || []).slice(0, 6)) {
      const img = await uploadImage(client, src);
      if (img) gallery.push({ ...img, _key: `g${gallery.length}` });
    }

    const houseArrangements = arrangementsForVilla(villa).map((row, index) => ({
      _type: "houseArrangementRow",
      _key: `arr${index}`,
      roomType: { _type: "reference", _ref: row.roomTypeId },
      quantity: row.quantity,
      customTitleEn: row.customTitleEn,
    }));

    await upsert(client, {
      _id: `property-${villa.slug}`,
      _type: "property",
      name: villa.name,
      slug: { _type: "slug", current: villa.slug },
      propertyKind: { _type: "reference", _ref: "propertyKind-villa" },
      locationRef: { _type: "reference", _ref: "location-blessedHouse" },
      regionEn: "Costa Rica",
      regionEs: "Costa Rica",
      shortDescription,
      description: toBlocks(description, `prop-${villa.id}`),
      priceMin: pricing.priceMin,
      priceMax: pricing.priceMax,
      currency: "USD",
      minimumNights: pricing.minimumNights,
      baseGuestCount: pricing.baseGuestCount,
      extraGuestFeePerNight: pricing.extraGuestFeePerNight,
      bathrooms: villa.bathrooms,
      petsMax: DEFAULT_PETS_MAX,
      houseArrangements,
      amenities: amenityKeys(villa),
      heroImage,
      gallery,
      mapLocation: {
        _type: "geopoint",
        lat: BH_COORDS.lat,
        lng: BH_COORDS.lng,
      },
      listed: true,
      houseRulesAreaRules: [
        {
          _key: "pool",
          titleEn: "Shared pool and gardens",
          bodyEn: toBlocks(
            "The pool and gardens are shared with other guests. Keep the area tidy, rinse off sand before swimming, and respect quiet use after 10 pm.",
            `pool-${villa.id}`
          ),
        },
        {
          _key: "occupancy",
          titleEn: "Occupancy and extra guests",
          bodyEn: toBlocks(
            `This villa sleeps up to ${villa.maxPeople} guests. The nightly rate includes ${pricing.baseGuestCount} guest${pricing.baseGuestCount === 1 ? "" : "s"}. Each extra adult or child is $${pricing.extraGuestFeePerNight} per night. Minimum stay is ${pricing.minimumNights} nights for online Reserve.`,
            `occ-${villa.id}`
          ),
        },
        {
          _key: "arrival",
          titleEn: "Arrival",
          bodyEn: toBlocks(
            "We will share check in instructions and access details before your arrival. Please let us know if you have an early flight or late transfer.",
            `arr-${villa.id}`
          ),
        },
        {
          _key: "pets",
          titleEn: "Pets",
          bodyEn: textToPortableBlocks(DEFAULT_PETS_AREA_BODY_EN, `pets-${villa.id}`),
        },
      ],
      houseRulesReview: {
        smokingEn: "No smoking inside. Outdoor areas only.",
        dogsEn: DEFAULT_PETS_REVIEW_EN,
        partiesEn: formatPartiesPolicy(villa.maxPeople),
        quietHoursEn: "Quiet hours from 10:00 PM to 8:00 AM.",
      },
    });
  }

  await seedTestBookings(client);

  console.log("Property booking seed complete.");
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
