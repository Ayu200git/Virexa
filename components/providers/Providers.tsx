"use client";

import { useState, useEffect } from "react";
import { SanityApp, type SanityConfig } from "@sanity/sdk-react";
import { projectId, dataset } from "@/sanity/env";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SanityApp
      config={[
        {
          projectId,
          dataset,
          apiVersion: "2024-11-12",
        } as SanityConfig,
      ]}
      fallback={null}
    >
      {children}
    </SanityApp>
  );
}
