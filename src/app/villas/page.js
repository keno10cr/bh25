import {
  getPropertyArrangements,
  getVillas,
  getVillasPageSettings,
} from "@/lib/sanity/content";
import VillasClient from "./villas-client";

export const revalidate = 60;

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
