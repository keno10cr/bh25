import { getActivities } from "@/lib/sanity/content";
import { STATIC_ACTIVITIES } from "@/data/activities";
import WelcomeClient from "./welcome-client";

export const metadata = {
  title: "Group Retreats | Blessed House",
  description:
    "Private estate buyouts in Puerto Viejo, Costa Rica for leadership teams, churches, sports groups, and company offsites of 20 to 45 guests.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 60;

const BH_PIN = {
  number: 1,
  slug: "blessed-house",
  title: "Blessed House",
  name: "Blessed House",
  category: "Blessed House",
  coordinates: { lat: 9.64735, lng: -82.77697 },
  pinColor: "#0a4c3a",
};

export default async function WelcomePage() {
  let activities = STATIC_ACTIVITIES;
  try {
    const cms = await getActivities();
    if (Array.isArray(cms) && cms.length) activities = cms;
  } catch {
    activities = STATIC_ACTIVITIES;
  }

  const galleryImages = [
    ...new Map(
      activities
        .filter((activity) => activity?.image)
        .map((activity) => [
          activity.image,
          {
            src: activity.image,
            translationKey: activity.translationKey || "",
            title:
              activity.title ||
              activity.name ||
              "",
            alt:
              activity.title ||
              activity.name ||
              "Blessed House activity",
          },
        ])
    ).values(),
  ];

  return <WelcomeClient mapPin={BH_PIN} galleryImages={galleryImages} />;
}
