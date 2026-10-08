"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";

export default function SiteChrome({ children, nav, footer }) {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const isAdmin = pathname?.startsWith("/admin");
  const isProposalTool = pathname === "/ccen" || pathname === "/cces";
  const isBusinessCard = pathname === "/bc" || pathname === "/t";
  const hideChrome = isAdmin || isProposalTool || isBusinessCard;

  useEffect(() => {
    const root = document.documentElement;
    const wasDebug = root.getAttribute("data-cms-debug");
    if (isAdmin) {
      root.setAttribute("data-cms-debug", "true");
    }
    return () => {
      if (isAdmin) {
        if (wasDebug) root.setAttribute("data-cms-debug", wasDebug);
        else root.removeAttribute("data-cms-debug");
      }
    };
  }, [isAdmin]);

  if (hideChrome) {
    return children;
  }

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t("a11y.skipToContent")}
      </a>
      <Navigation nav={nav} />
      <div id="main-content" tabIndex={-1} className="main-content-anchor">
        {children}
      </div>
      <Footer footer={footer} />
    </>
  );
}
