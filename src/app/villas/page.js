import {
  getPropertyArrangements,
  getVillas,
  getVillasPageSettings,
} from "@/lib/sanity/content";
import VillasClient from "./villas-client";

export const revalidate = 60;

export const metadata = {
  title: "Villas and Bungalows in Puerto Viejo",
  description:
    "Private jungle villas and bungalows at Blessed House in Puerto Viejo, Costa Rica, with a shared pool, WiFi, kitchens, and parking. Compare beds, guests, and amenities.",
  alternates: { canonical: "/villas" },
};

export default async function VillasPage() {
  const [villas, copy, arrangements] = await Promise.all([
    getVillas(),
    getVillasPageSettings(),
    getPropertyArrangements(),
  ]);
  const withRooms = villas.map((villa) => ({
    ...villa,
    houseArrangements: arrangements[villa.slug] || [],
  }));
  return <VillasClient villas={withRooms} copy={copy} />;
}
