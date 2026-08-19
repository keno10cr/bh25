import { getVillas, getVillasPageSettings } from "@/lib/sanity/content";
import VillasClient from "./villas-client";

export const revalidate = 60;

export default async function VillasPage() {
  const [villas, copy] = await Promise.all([
    getVillas(),
    getVillasPageSettings(),
  ]);
  return <VillasClient villas={villas} copy={copy} />;
}
