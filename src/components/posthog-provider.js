"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { capturePostHogPageview, initPostHog } from "@/lib/posthog";

export default function PostHogProvider({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    capturePostHogPageview(window.location.href);
  }, [pathname]);

  return children;
}
