import {
  NextStudioLayout,
  metadata as studioMetadata,
  viewport as studioViewport,
} from "next-sanity/studio";
import { siteIcons } from "@/lib/siteMetadata";

export const metadata = {
  ...studioMetadata,
  title: "BH Studio",
  description: "Blessed House content studio. Sign in to edit villas, bookings, and site copy.",
  robots: { index: false, follow: false },
  // Keep Blessed House brand favicon even inside Sanity Studio (/admin).
  icons: siteIcons,
  manifest: "/favicon/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Blessed House",
  },
};

export const viewport = {
  ...studioViewport,
  themeColor: "#0a4c3a",
};

export default function AdminLayout({ children }) {
  return <NextStudioLayout>{children}</NextStudioLayout>;
}
