import { getGalleryPageSettings } from "@/lib/sanity/content";
import GalleryClient from "./gallery-client";

export const revalidate = 60;

export const metadata = {
  title: "Gallery | Blessed House Villas",
  description:
    "Photos of Blessed House, the villas, and the Puerto Viejo coast.",
};

export default async function GalleryPage() {
  const copy = await getGalleryPageSettings();
  return <GalleryClient copy={copy} />;
}
