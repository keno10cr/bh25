import { getFooterSettings } from "@/lib/sanity/content";
import BusinessCard from "./business-card";

export const metadata = {
  title: "Blessed House | Digital Business Card",
  description:
    "Contact Blessed House Villas in Puerto Viejo, Costa Rica. Call, WhatsApp, email, directions, and socials in one place.",
  openGraph: {
    title: "Blessed House | Digital Business Card",
    description:
      "Private villas in the Caribbean rainforest of Puerto Viejo, Costa Rica.",
    images: ["/BannerVilla4.jpg"],
  },
};

export const revalidate = 60;

export default async function BusinessCardPage() {
  const footer = await getFooterSettings();
  return <BusinessCard footer={footer} />;
}
