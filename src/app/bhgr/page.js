import GroupQuoteTool from "@/components/group-quote/group-quote-tool";
import { createSanityReadClient } from "@/lib/sanity/client";
import { urlForImage } from "@/lib/sanity/image";
import { getSystemSettings } from "@/lib/systemSettingsData";
import { getCrcBaseRate } from "@/lib/exchangeRate";
import { getFooterSettings } from "@/lib/sanity/content";
import {
  occupiedNightsFromStay,
  toIsoDateList,
  tomorrowIsoDate,
} from "@/lib/availabilityDates";
import { sumHouseArrangementCapacity } from "@/lib/propertyPricing";

export const metadata = {
  title: { absolute: "Group Reservations Quote" },
  description: "Internal group and buyout quote generator for Villas Blessed House.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const PROPERTIES_QUERY = `*[_type == "property" && listed != false && defined(slug.current) && !(_id in path("drafts.**"))]{
  _id,
  name,
  nameEn,
  "slug": slug.current,
  priceMin,
  priceMax,
  currency,
  minimumNights,
  baseGuestCount,
  extraGuestFeePerNight,
  cleaningFee,
  seasonalPricing[]{ titleEn, startDate, endDate, price },
  houseArrangements[]{ quantity, roomType->{ capacity } },
  heroImage{ asset, hotspot, crop, alt },
  "firstGalleryImage": gallery[0]{ asset, hotspot, crop, alt }
}`;

const BLOCKED_QUERY = `{
  "blocked": *[_type == "blockedDate" && defined(property._ref) && endDate >= $from && !(_id in path("drafts.**"))]{
    "propertyId": property._ref, startDate, endDate
  },
  "paid": *[_type == "stayBooking" && paymentStatus == "paid" && defined(property._ref) && checkOut > $from && !(_id in path("drafts.**"))]{
    "propertyId": property._ref, checkIn, checkOut
  }
}`;

function villaNumber(name) {
  const match = /#\s*(\d+)/.exec(name || "") || /(\d+)/.exec(name || "");
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function photoUrl(image, width, height) {
  if (!image?.asset) return null;
  return urlForImage(image)
    .width(width)
    .height(height)
    .fit("crop")
    .format("jpg")
    .quality(80)
    .url();
}

async function loadGroupQuoteData() {
  const client = createSanityReadClient();
  const from = tomorrowIsoDate();
  const [properties, calendar, settings, footer] = await Promise.all([
    client.fetch(PROPERTIES_QUERY),
    client.fetch(BLOCKED_QUERY, { from }),
    getSystemSettings(),
    getFooterSettings(),
  ]);
  const exchangeRate = await getCrcBaseRate(settings);

  const unavailable = new Map();
  const mark = (propertyId, dates) => {
    if (!unavailable.has(propertyId)) unavailable.set(propertyId, new Set());
    const set = unavailable.get(propertyId);
    dates.forEach((iso) => {
      if (iso >= from) set.add(iso);
    });
  };
  (calendar?.blocked || []).forEach((row) =>
    mark(row.propertyId, toIsoDateList(row.startDate, row.endDate))
  );
  (calendar?.paid || []).forEach((row) =>
    mark(row.propertyId, occupiedNightsFromStay(row.checkIn, row.checkOut))
  );

  const villas = (properties || [])
    .map((p) => {
      const image = p.heroImage?.asset ? p.heroImage : p.firstGalleryImage;
      const guestsMax = sumHouseArrangementCapacity(p.houseArrangements) || 2;
      return {
        id: p._id,
        slug: p.slug,
        name: p.name,
        nameEn: p.nameEn || "",
        priceMin: p.priceMin,
        priceMax: p.priceMax,
        currency: p.currency || "USD",
        minimumNights: p.minimumNights,
        baseGuestCount: p.baseGuestCount,
        extraGuestFeePerNight: p.extraGuestFeePerNight,
        cleaningFee: typeof p.cleaningFee === "number" ? p.cleaningFee : null,
        seasonalPricing: p.seasonalPricing || [],
        guestsMax,
        capacity: guestsMax,
        photo: photoUrl(image, 960, 600),
        thumb: photoUrl(image, 160, 110),
        photoAlt: image?.alt || p.name,
        unavailableDates: Array.from(unavailable.get(p._id) || []).sort(),
      };
    })
    .sort((a, b) => villaNumber(a.name) - villaNumber(b.name));

  const contact = { email: footer.email.value, phones: footer.phones };

  return { villas, settings, minDate: from, exchangeRate, contact };
}

export default async function BhgrPage() {
  const { villas, settings, minDate, exchangeRate, contact } =
    await loadGroupQuoteData();
  return (
    <GroupQuoteTool
      villas={villas}
      settings={settings}
      minDate={minDate}
      exchangeRate={exchangeRate}
      contact={contact}
    />
  );
}
