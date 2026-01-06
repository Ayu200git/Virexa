"use client";

import dynamic from "next/dynamic";

const ActivitiesList = dynamic(
  () => import("./ActivitiesList").then((mod) => mod.ActivitiesList),
  { ssr: false }
);

const CreateActivityDialog = dynamic(
  () =>
    import("./CreateActivityDialog").then((mod) => mod.CreateActivityDialog),
  { ssr: false }
);

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">
            Manage your fitness class types and categories.
          </p>
        </div>
        <CreateActivityDialog />
      </div>

      <ActivitiesList />
    </div>
  );
}
