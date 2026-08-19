import { notFound } from "next/navigation";
import ActivityPageView from "@/components/activity-page-view";
import {
  getActivityBySlug,
  getActivitySlugs,
  getLegendItems,
} from "@/lib/sanity/content";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getActivitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) return { title: "Activity not found" };
  return {
    title: `${activity.name} | Blessed House Activities`,
    description:
      activity.description?.slice(0, 155) ||
      "Things to do near Blessed House in Puerto Viejo, Costa Rica.",
  };
}

export default async function ActivityPage({ params }) {
  const { slug } = await params;
  const [activity, legendItems] = await Promise.all([
    getActivityBySlug(slug),
    getLegendItems(),
  ]);
  if (!activity) notFound();

  return <ActivityPageView activity={activity} legendItems={legendItems} />;
}
