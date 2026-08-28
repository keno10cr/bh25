import { notFound } from "next/navigation";
import ActivityPageView from "@/components/activity-page-view";
import { activityStructuredImages } from "@/lib/activity-content";
import {
  getActivityBySlug,
  getActivitySlugs,
  getLegendItems,
} from "@/lib/sanity/content";
import { SITE_NAME, SITE_URL } from "@/lib/siteMetadata";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getActivitySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) return { title: "Activity not found" };

  const description = (activity.description || activity.fullDescription || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const pageUrl = `${SITE_URL}/activities/${activity.slug}`;
  const images = activityStructuredImages(activity, activity.name);
  const ogImages = images.map((image) => ({
    url: image.url,
    alt: image.alt,
  }));

  return {
    title: `${activity.name} | Blessed House Activities`,
    description:
      description ||
      "Things to do near Blessed House in Puerto Viejo, Costa Rica.",
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: SITE_NAME,
      title: `${activity.name} | ${SITE_NAME}`,
      description,
      images: ogImages.length ? ogImages : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${activity.name} | ${SITE_NAME}`,
      description,
      images: ogImages.length ? ogImages.map((image) => image.url) : undefined,
    },
  };
}

export default async function ActivityPage({ params }) {
  const { slug } = await params;
  const [activity, legendItems] = await Promise.all([
    getActivityBySlug(slug),
    getLegendItems(),
  ]);
  if (!activity) notFound();

  const pageUrl = `${SITE_URL}/activities/${activity.slug}`;
  const images = activityStructuredImages(activity, activity.name);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    name: activity.name,
    description:
      activity.description ||
      activity.fullDescription ||
      "Activity near Blessed House in Puerto Viejo, Costa Rica.",
    url: pageUrl,
    image: images.map((image) => image.url),
    ...(images.length
      ? {
          photo: images.map((image) => ({
            "@type": "ImageObject",
            url: image.url,
            caption: image.alt,
            name: image.alt,
          })),
        }
      : {}),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Puerto Viejo",
      addressRegion: "Limón",
      addressCountry: "CR",
    },
    ...(Array.isArray(activity.whatsIncluded) && activity.whatsIncluded.length
      ? {
          amenityFeature: activity.whatsIncluded.map((name) => ({
            "@type": "LocationFeatureSpecification",
            name,
          })),
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ActivityPageView activity={activity} legendItems={legendItems} />
    </>
  );
}
