import Hero from "@/components/hero";
import WelcomeSection from "@/components/welcome-section";
import OurPlace from "@/components/our-place";
import FeaturedVillas from "@/components/featured-villas";
import LocationSection from "@/components/location-section";
import ActivityPreview from "@/components/activity-preview";
import ReviewsSection from "@/components/reviews-section";
import {
  getAboutPageSettings,
  getHomePageSettings,
  getReviews,
  getVillas,
} from "@/lib/sanity/content";

export const revalidate = 60;

export default async function Home() {
  const [reviews, home, about, villas] = await Promise.all([
    getReviews(),
    getHomePageSettings(),
    getAboutPageSettings(),
    getVillas(),
  ]);

  return (
    <main>
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
      <FeaturedVillas copy={home} villas={villas} />
      <LocationSection copy={home} />
      <ActivityPreview copy={home} />
      <ReviewsSection reviews={reviews} copy={home} />
    </main>
  );
}
