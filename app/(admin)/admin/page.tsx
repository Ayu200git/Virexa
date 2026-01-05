"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
<<<<<<< HEAD
import { ActivityHeader } from "./activities/[id]/ActivityHeader";
import { ActivityDetails } from "./activities/[id]/ActivityDetails";
import { ActivityDetailSkeleton } from "./activities/[id]/ActivityDetailsSkeleton";
=======
import { ActivityHeader } from "./ActivityHeader";
import { ActivityDetails } from "./ActivityDetails";
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
