"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ActivityHeader } from "./ActivityHeader";
import { ActivityDetails } from "./ActivityDetails";
<<<<<<< HEAD
import { ActivityDetailSkeleton } from "./ActivityDetailsSkeleton";
=======
import { ActivityDetailSkeleton } from "./ActivityDetailSkeleton";
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09

export default function ActivityDetailPage() {
  const params = useParams();
  const documentId = params.id as string;

  return (
    <div className="space-y-6">
      <Suspense fallback={<ActivityDetailSkeleton />}>
        <ActivityHeader documentId={documentId} />
        <ActivityDetails documentId={documentId} />
      </Suspense>
    </div>
  );
}
