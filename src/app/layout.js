import Script from "next/script";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PostHogProvider from "@/components/posthog-provider";
import SiteChrome from "@/components/site-chrome";
import { Analytics } from "@vercel/analytics/react";
import {
  SITE_DESCRIPTION,
  SITE_URL,
  defaultOpenGraph,
  defaultTwitter,
  siteIcons,
} from "@/lib/siteMetadata";
import "./globals.css";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Blessed House Villas - Puerto Viejo",
    template: "%s | Blessed House",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Blessed House",
  icons: siteIcons,
  manifest: "/favicon/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Blessed House",
  },
  openGraph: defaultOpenGraph,
  twitter: defaultTwitter,
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport = {
  themeColor: "#0a4c3a",
};

export default function RootLayout({ children }) {
  const cmsDebug = process.env.NODE_ENV === "development" ? "true" : undefined;

  return (
    <html lang="en" data-cms-debug={cmsDebug}>
      <body>
        {/* Google Tag Manager (noscript) Fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-W68VV7M3"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Main GTM Script running optimally afterInteractive */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-W68VV7M3');
          `}
        </Script>

        <LanguageProvider>
          <PostHogProvider>
            <SiteChrome>{children}</SiteChrome>
          </PostHogProvider>
        </LanguageProvider>

        <Analytics />
      </body>
    </html>
  );
}
