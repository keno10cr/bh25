import { STATIC_ACTIVITIES } from "@/data/activities";
import { getActivities, getFooterSettings } from "@/lib/sanity/content";

export async function loadProposalData() {
  const [activities, phones] = await Promise.all([
    getActivities({ includeGroupOnly: true })
      .then((items) =>
        Array.isArray(items) && items.length ? items : STATIC_ACTIVITIES
      )
      .catch(() => STATIC_ACTIVITIES),
    getFooterSettings()
      .then((footer) => footer?.phones || [])
      .catch(() => []),
  ]);
  return { activities, phones };
}
