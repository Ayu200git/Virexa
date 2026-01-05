"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { VenueHeader } from "./VenueHeader";
import { VenueDetails } from "./VenueDetails";
<<<<<<< HEAD
import { VenueDetailSkeleton } from "./VenueDetailsSkeleton";
=======
import { VenueDetailSkeleton } from "./VenueDetailSkeleton";
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09

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
