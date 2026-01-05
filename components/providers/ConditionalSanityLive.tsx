"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

/**
 * Conditionally renders SanityLive only when on localhost
 * This prevents CORS errors when accessing from non-localhost network IPs
 * 
 * Note: Sanity Live API requires the origin to be whitelisted in Sanity's CORS settings.
 * When accessing from a network IP (like 172.24.176.1), it will fail with CORS errors.
 * This component only enables SanityLive when on localhost to avoid these errors.
 * 
 * For production, add your domain to Sanity's CORS settings in the Sanity dashboard.
 */
const SanityLiveWrapper = dynamic(
  () => import("./SanityLiveWrapper").then((mod) => ({ default: mod.SanityLiveWrapper })),
  { ssr: false }
);

export function ConditionalSanityLive() {
  const [shouldEnable, setShouldEnable] = useState(false);

  useEffect(() => {
    // Check if we're on localhost
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLocalhost =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]";

      // Only enable if localhost
      // In production, you should add your domain to Sanity's CORS settings
      // and remove this check or modify it to allow your production domain
      setShouldEnable(isLocalhost);
    }
  }, []);

  // Don't render until we've checked the hostname, or if not localhost
  if (!shouldEnable) {
    return null;
  }

  return <SanityLiveWrapper />;
}

