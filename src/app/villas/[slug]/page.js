import { notFound } from "next/navigation";
import VillaDetailView from "@/components/villa-detail-view";
import {
  getPropertyBySlug,
  getVillaBySlug,
  getVillaReviews,
  getVillaSlugs,
} from "@/lib/sanity/content";
import { SITE_NAME, SITE_URL } from "@/lib/siteMetadata";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getVillaSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [villa, property] = await Promise.all([
    getVillaBySlug(slug),
    getPropertyBySlug(slug),
  ]);
  if (!villa) return { title: "Villa not found" };

  const description = (
    property?.shortDescription ||
    villa.description ||
    "Caribbean style villa in Puerto Viejo, Limón, Costa Rica."
  )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);

  const image =
    property?.heroImage ||
    property?.gallery?.[0] ||
    villa.image ||
    villa.galleryImages?.[0];
  const pageUrl = `${SITE_URL}/villas/${villa.slug}`;

  return {
    title: villa.name,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      type: "website",
      url: pageUrl,
      siteName: SITE_NAME,
      title: `${villa.name} | ${SITE_NAME}`,
      description,
      images: image
        ? [{ url: image, alt: villa.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${villa.name} | ${SITE_NAME}`,
      description,
      images: image ? [image] : undefined,
    },
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

  const siteUrl = SITE_URL;
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
