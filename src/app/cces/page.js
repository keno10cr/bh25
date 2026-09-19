import ProposalGenerator from "@/components/proposal-generator/proposal-generator";
import { STATIC_ACTIVITIES } from "@/data/activities";
import { getActivities } from "@/lib/sanity/content";

export const metadata = {
  title: {
    absolute: "Propuesta Privada",
  },
  description:
    "Generador interno de propuestas en español para alquiler exclusivo de Villas Blessed House.",
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 60;

export default async function CcesPage() {
  let activities = STATIC_ACTIVITIES;
  try {
    const cmsActivities = await getActivities({ includeGroupOnly: true });
    if (Array.isArray(cmsActivities) && cmsActivities.length) {
      activities = cmsActivities;
    }
  } catch {
    activities = STATIC_ACTIVITIES;
  }

  return <ProposalGenerator locale="es" activities={activities} />;
}
