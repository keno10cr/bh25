import Hero from "@/components/hero";
import WelcomeSection from "@/components/welcome-section";
import OurPlace from "@/components/our-place";
import FeaturedVillas from "@/components/featured-villas";
import LocationSection from "@/components/location-section";
import ActivityPreview from "@/components/activity-preview";

export default function Home() {
  return (
    <main>
      <Hero />
      <WelcomeSection />
      <OurPlace />
      <FeaturedVillas />
      <LocationSection />
      <ActivityPreview />
    </main>
  );
}
