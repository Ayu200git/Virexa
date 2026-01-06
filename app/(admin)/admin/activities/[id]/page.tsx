"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { ActivityDetailSkeleton } from "./ActivityDetailsSkeleton";

const ActivityHeader = dynamic(
  () => import("./ActivityHeader").then((mod) => mod.ActivityHeader),
  { ssr: false }
);

const ActivityDetails = dynamic(
  () => import("./ActivityDetails").then((mod) => mod.ActivityDetails),
  { ssr: false }
);

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
