"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

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

  if (isAdmin) {
    return children;
  }

  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
