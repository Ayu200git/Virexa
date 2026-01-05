import { SanityLive } from "@/sanity/lib/live";

/**
 * Server component wrapper for SanityLive
 * This must be a server component because defineLive can only be used in Server Components
 */
export function SanityLiveWrapper() {
  return <SanityLive />;
}

