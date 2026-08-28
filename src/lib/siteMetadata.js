/** Shared site metadata for public pages and Studio (/admin). */

export const SITE_URL = "https://www.blessedhouse.info";

export const SITE_NAME = "Blessed House Villas";

export const SITE_DESCRIPTION =
  "Caribbean style villas in Puerto Viejo, Limón. Experience tropical adventures and beachside relaxation.";

export const siteIcons = {
  icon: [
    { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    { url: "/favicon/favicon.ico", sizes: "any" },
    {
      url: "/favicon/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
  ],
  shortcut: "/favicon/favicon.ico",
  apple: [
    {
      url: "/favicon/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
  ],
  other: [
    {
      rel: "apple-touch-icon",
      url: "/favicon/apple-touch-icon.png",
    },
    {
      rel: "mask-icon",
      url: "/favicon/android-chrome-192x192.png",
    },
  ],
};

export const defaultOpenGraph = {
  type: "website",
  locale: "en_US",
  url: SITE_URL,
  siteName: SITE_NAME,
  title: "Blessed House Villas - Puerto Viejo",
  description: SITE_DESCRIPTION,
  images: [
    {
      url: `${SITE_URL}/favicon/android-chrome-512x512.png`,
      width: 512,
      height: 512,
      alt: "Blessed House",
    },
  ],
};

export const defaultTwitter = {
  card: "summary_large_image",
  title: "Blessed House Villas - Puerto Viejo",
  description: SITE_DESCRIPTION,
  images: [`${SITE_URL}/favicon/android-chrome-512x512.png`],
};
