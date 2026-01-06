"use client";

import dynamic from "next/dynamic";

const VenuesList = dynamic(
  () => import("./VanuesList").then((mod) => mod.VenuesList),
  { ssr: false }
);

const CreateVenueDialog = dynamic(
  () => import("./CreateVenueDialog").then((mod) => mod.CreateVenueDialog),
  { ssr: false }
);

export default function VenuesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">
            Manage your studio locations and facilities.
          </p>
        </div>
        <CreateVenueDialog />
      </div>

      <VenuesList />
    </div>
  );
}
