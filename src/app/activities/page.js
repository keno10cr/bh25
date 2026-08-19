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
  return (
    <ActivitiesClient
      activities={activities}
      mapActivities={mapActivities}
      legendItems={legendItems}
      copy={copy}
    />
  );
}
