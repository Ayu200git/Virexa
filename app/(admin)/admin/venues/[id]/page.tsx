"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { VenueDetailSkeleton } from "./VenueDetailsSkeleton";

const VenueHeader = dynamic(
  () => import("./VenueHeader").then((mod) => mod.VenueHeader),
  { ssr: false }
);

const VenueDetails = dynamic(
  () => import("./VenueDetails").then((mod) => mod.VenueDetails),
  { ssr: false }
);

export default function VenueDetailPage() {
  const params = useParams();
  const documentId = params.id as string;

  return (
    <div className="space-y-6">
      <Suspense fallback={<VenueDetailSkeleton />}>
        <VenueHeader documentId={documentId} />
        <VenueDetails documentId={documentId} />
      </Suspense>
    </div>
  );
}
