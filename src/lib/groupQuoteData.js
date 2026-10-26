import { createSanityReadClient } from "./sanity/client";
import { urlForImage } from "./sanity/image";
import { getSystemSettings } from "./systemSettingsData";
import { getCrcBaseRate } from "./exchangeRate";
import { getFooterSettings } from "./sanity/content";
import { tomorrowIsoDate } from "./availabilityDates";
import { ensureAirbnbCalendarsFresh } from "./ical/syncAirbnb";
import { sumHouseArrangementCapacity } from "./propertyPricing";
import { loadUnavailableNightsByVilla } from "./estateAvailability";

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
  seasonalPricing[]{ titleEn, titleEs, startDate, endDate, price },
  houseArrangements[]{ quantity, roomType->{ capacity } },
  heroImage{ asset, hotspot, crop, alt },
  "firstGalleryImage": gallery[0]{ asset, hotspot, crop, alt }
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

export async function loadGroupQuoteData() {
  await ensureAirbnbCalendarsFresh();
  const client = createSanityReadClient();
  const from = tomorrowIsoDate();
  const [properties, unavailable, settings, footer] = await Promise.all([
    client.fetch(PROPERTIES_QUERY),
    loadUnavailableNightsByVilla(client, from),
    getSystemSettings(),
    getFooterSettings(),
  ]);
  const exchangeRate = await getCrcBaseRate(settings);

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
