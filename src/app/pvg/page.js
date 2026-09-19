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

const TRANSLATION_KEY_BY_SLUG = Object.fromEntries(
  STATIC_ACTIVITIES.filter((item) => item.slug && item.translationKey).map(
    (item) => [item.slug, item.translationKey]
  )
);

function isTennisNearPlayaNegra(activity) {
  const slug = String(activity?.slug || "").toLowerCase();
  const raw = String(activity?.title || activity?.name || "").trim().toLowerCase();
  if (slug.includes("tennis") && (slug.includes("negra") || slug.includes("playa"))) {
    return true;
  }
  return raw.includes("tennis") && raw.includes("negra");
}

function galleryLabelKey(activity) {
  if (isTennisNearPlayaNegra(activity)) return "tennisNearPlayaNegra";
  return "";
}

export default async function PvgPage() {
  let activities = STATIC_ACTIVITIES;
  let copy = null;
  try {
    const [cmsActivities, settings] = await Promise.all([
      getActivities({ includeGroupOnly: true }),
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
          const labelKey = galleryLabelKey(activity);
          const fallbackTitle = String(
            activity?.title || activity?.name || ""
          ).trim();
          return [
            src,
            {
              src,
              slug: activity.slug || "",
              translationKey:
                activity.translationKey ||
                TRANSLATION_KEY_BY_SLUG[activity.slug] ||
                "",
              labelKey,
              title: labelKey ? "" : fallbackTitle,
              alt:
                fallbackTitle ||
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
