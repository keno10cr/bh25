import { Suspense } from "react";
import { getActivities, getPvgPageSettings } from "@/lib/sanity/content";
import { STATIC_ACTIVITIES } from "@/data/activities";
import { PVG_PAGE_DEFAULTS } from "@/data/pvg-defaults";
import PvgClient from "./pvg-client";

export const metadata = {
  title: "Puerto Viejo Groups | Blessed House",
  description:
    "Private estate buyouts in Puerto Viejo, Costa Rica for leadership teams, churches, sports groups, and company offsites of 20 to 45 guests.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 60;

function normalizeGalleryTitle(activity) {
  const raw = String(activity?.title || activity?.name || "").trim();
  const lower = raw.toLowerCase();
  if (lower.includes("tennis") && lower.includes("negra")) {
    return "Tennis court near Playa Negra";
  }
  if (lower === "ketos") return "";
  if (lower.includes("waste sorting")) return "";
  return raw;
}

export default async function PvgPage() {
  let activities = STATIC_ACTIVITIES;
  let copy = null;
  try {
    const [cmsActivities, settings] = await Promise.all([
      getActivities(),
      getPvgPageSettings(),
    ]);
    if (Array.isArray(cmsActivities) && cmsActivities.length) {
      activities = cmsActivities;
    }
    copy = settings;
  } catch {
    activities = STATIC_ACTIVITIES;
    copy = null;
  }

  const lat = Number(
    copy?.locationLat?.value ?? PVG_PAGE_DEFAULTS.locationLat
  );
  const lng = Number(
    copy?.locationLng?.value ?? PVG_PAGE_DEFAULTS.locationLng
  );

  const mapPin = {
    number: 1,
    slug: "blessed-house",
    title: "Blessed House",
    name: "Blessed House",
    category: "Blessed House",
    coordinates: {
      lat: Number.isFinite(lat) ? lat : PVG_PAGE_DEFAULTS.locationLat,
      lng: Number.isFinite(lng) ? lng : PVG_PAGE_DEFAULTS.locationLng,
    },
    pinColor: "#0a4c3a",
  };

  const galleryImages = [
    ...new Map(
      activities
        .filter((activity) => activity?.image)
        .map((activity) => {
          const isPuntaMona =
            activity.slug === "punta-mona" ||
            activity.translationKey === "puntaMona";
          const src = isPuntaMona
            ? "/activities/all/puntaMona.jpg"
            : activity.image;
          const title = normalizeGalleryTitle(activity);
          return [
            src,
            {
              src,
              translationKey: activity.translationKey || "",
              title,
              alt:
                title ||
                activity.title ||
                activity.name ||
                "Blessed House activity",
            },
          ];
        })
    ).values(),
  ];

  return (
    <Suspense fallback={<main style={{ minHeight: "60vh" }} />}>
      <PvgClient mapPin={mapPin} galleryImages={galleryImages} copy={copy} />
    </Suspense>
  );
}
