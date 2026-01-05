"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { ActivityHeader } from "./activities/[id]/ActivityHeader";
import { ActivityDetails } from "./activities/[id]/ActivityDetails";
import { ActivityDetailSkeleton } from "./activities/[id]/ActivityDetailsSkeleton";

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
