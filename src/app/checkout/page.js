import { notFound } from "next/navigation";
import { decodeBookingQuote } from "@/lib/bookingPricing";
import { parseGuestSelection } from "@/lib/guestSelection";
import { getPropertyBySlug } from "@/lib/sanity/content";
import { getSystemSettings } from "@/lib/systemSettingsData";
import CheckoutClient from "@/components/checkout-client";

function getSingleParam(value) {
  return Array.isArray(value) ? value[0] : value;
}

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }) {
  const query = await searchParams;
  const propertySlug = getSingleParam(query.property);
  if (!propertySlug) notFound();

  const [property, settings] = await Promise.all([
    getPropertyBySlug(propertySlug),
    getSystemSettings(),
  ]);
  if (!property) notFound();

  const quoteParam = getSingleParam(query.quote);
  const decodedQuote = quoteParam ? decodeBookingQuote(quoteParam) : null;

  return (
    <CheckoutClient
      property={property}
      settings={settings}
      initialCheckIn={getSingleParam(query.checkIn) || ""}
      initialCheckOut={getSingleParam(query.checkOut) || ""}
      initialGuests={parseGuestSelection({
        adults: getSingleParam(query.adults),
        children: getSingleParam(query.children),
        pets: getSingleParam(query.pets),
      })}
      initialQuote={decodedQuote}
    />
  );
}
