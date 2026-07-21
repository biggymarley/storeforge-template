"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { trackPageView } from "@/lib/analytics";

/**
 * Meta Pixel PageView for client-side navigations. The base snippet in
 * app/layout.tsx fires PageView once per hard load; App Router route changes
 * never reload the document, so this covers every navigation after that.
 * Rendered by the root layout only when metaPixelId is configured.
 */
export function PixelPageView() {
  const pathname = usePathname();
  const initialLoad = useRef(true);

  useEffect(() => {
    // The base snippet already counted the hard-load PageView — skip it here.
    if (initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    trackPageView();
  }, [pathname]);

  return null;
}
