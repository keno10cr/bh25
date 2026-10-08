import { getGalleryPageSettings } from "@/lib/sanity/content";
import GalleryClient from "./gallery-client";

export const revalidate = 60;

export const metadata = {
  title: "Photo Gallery, Villas and Puerto Viejo",
  description:
    "Photos of Blessed House, the villas, and the Puerto Viejo coast.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const copy = await getGalleryPageSettings();
  return <GalleryClient copy={copy} />;
}
