import {
  getActivities,
  getActivitiesPageSettings,
  getLegendItems,
} from "@/lib/sanity/content";
import ActivitiesClient from "./activities-client";

export const revalidate = 60;

export default async function ActivitiesPage() {
  const [activities, copy, legendItems] = await Promise.all([
    getActivities(),
    getActivitiesPageSettings(),
    getLegendItems(),
  ]);
  const mapActivities = activities.filter(
    (activity) => activity.coordinates?.lat && activity.coordinates?.lng
  );
  const usedLegends = new Set(
    activities.flatMap((activity) =>
      (activity.legendItems || []).map((item) => item.slug).filter(Boolean)
    )
  );
  const visibleLegends = legendItems.filter((item) => usedLegends.has(item.slug));
  return (
    <ActivitiesClient
      activities={activities}
      mapActivities={mapActivities}
      legendItems={visibleLegends.length ? visibleLegends : legendItems}
      copy={copy}
    />
  );
}
