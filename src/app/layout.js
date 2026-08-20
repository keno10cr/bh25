import Script from "next/script";
import { LanguageProvider } from "@/contexts/LanguageContext";
import PostHogProvider from "@/components/posthog-provider";
import SiteChrome from "@/components/site-chrome";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata = {
  title: "Blessed House Villas - Puerto Viejo",
  description:
    "Caribbean style villas in Puerto Viejo, Limón. Experience tropical adventures and beachside relaxation.",
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
    other: [
      {
        rel: "apple-touch-icon",
        url: "/favicon/apple-touch-icon.png",
      },
    ],
  },
  manifest: "/favicon/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Blessed House",
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
