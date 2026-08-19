import { NextStudioLayout, metadata as studioMetadata, viewport as studioViewport } from "next-sanity/studio";

export const metadata = {
  ...studioMetadata,
  title: "BH Studio",
  robots: { index: false, follow: false },
};

export const viewport = studioViewport;

export default function AdminLayout({ children }) {
  return <NextStudioLayout>{children}</NextStudioLayout>;
}
