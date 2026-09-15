"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function SiteChrome({ children, nav, footer }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isProposalTool = pathname === "/ccen" || pathname === "/cces";
  const hideChrome = isAdmin || isProposalTool;

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
      <Navigation nav={nav} />
      {children}
      <Footer footer={footer} />
    </>
  );
}
