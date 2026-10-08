import Hero from "@/components/hero";
import WelcomeSection from "@/components/welcome-section";
import OurPlace from "@/components/our-place";
import StorySection from "@/components/story-section";
import FeaturedVillas from "@/components/featured-villas";
import LocationSection from "@/components/location-section";
import ActivityPreview from "@/components/activity-preview";
import ReviewsSection from "@/components/reviews-section";
import GroupsCta from "@/components/groups-cta";
import {
  getAboutPageSettings,
  getGroupsPromo,
  getHomePageSettings,
  getReviews,
  getVillas,
} from "@/lib/sanity/content";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/siteMetadata";

export const revalidate = 60;

export const metadata = {
  alternates: { canonical: "/" },
};

const lodgingJsonLd = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Blessed House Villas",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  image: `${SITE_URL}/BannerVilla4.jpg`,
  logo: `${SITE_URL}/blessedhouse_logo25.png`,
  telephone: "+50689262630",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Puerto Viejo de Talamanca",
    addressRegion: "Limón",
    addressCountry: "CR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 9.64735,
    longitude: -82.77697,
  },
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Shared pool", value: true },
    { "@type": "LocationFeatureSpecification", name: "Free WiFi", value: true },
    { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
  ],
};

export default async function Home() {
  const [reviews, home, about, villas, groupsPromo] = await Promise.all([
    getReviews(),
    getHomePageSettings(),
    getAboutPageSettings(),
    getVillas(),
    getGroupsPromo(),
  ]);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(lodgingJsonLd) }}
      />
      <Hero copy={home} />
      <WelcomeSection copy={about} />
      <OurPlace
        copy={{
          ...about,
          ourPlaceImage: home.ourPlaceImage?.fromCms
            ? home.ourPlaceImage
            : about.ourPlaceImage,
          ourPlaceImageAlt: home.ourPlaceImageAlt?.fromCms
            ? home.ourPlaceImageAlt
            : about.ourPlaceImageAlt,
        }}
      />
      <StorySection copy={home} />
      <FeaturedVillas copy={home} villas={villas} />
      <LocationSection copy={home} />
      <ActivityPreview copy={home} />
      <ReviewsSection reviews={reviews} copy={home} />
      <GroupsCta copy={groupsPromo} />
    </main>
  );
}
