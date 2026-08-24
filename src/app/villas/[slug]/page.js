import { notFound } from "next/navigation";
import VillaDetailView from "@/components/villa-detail-view";
import {
  getPropertyBySlug,
  getVillaBySlug,
  getVillaReviews,
  getVillaSlugs,
} from "@/lib/sanity/content";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getVillaSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const villa = await getVillaBySlug(slug);
  if (!villa) return { title: "Villa not found" };
  return {
    title: `${villa.name} | Blessed House Villas`,
    description:
      villa.description?.slice(0, 155) ||
      "Caribbean style villa in Puerto Viejo, Limón, Costa Rica.",
  };
}

export default async function VillaPage({ params }) {
  const { slug } = await params;
  const villa = await getVillaBySlug(slug);
  if (!villa) notFound();
  const [reviews, property] = await Promise.all([
    getVillaReviews(slug),
    getPropertyBySlug(slug),
  ]);

  const siteUrl = "https://www.blessedhouse.info";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: villa.name,
    description: villa.description,
    url: `${siteUrl}/villas/${villa.slug}`,
    image: villa.image,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Puerto Viejo",
      addressRegion: "Limón",
      addressCountry: "CR",
    },
    numberOfRooms: villa.bedrooms,
    amenityFeature: (villa.amenities || []).map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VillaDetailView villa={villa} property={property} reviews={reviews} />
    </>
  );
}
