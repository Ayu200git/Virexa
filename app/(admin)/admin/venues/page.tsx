import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { VenuesList } from "./VenuesList";

const VENUES_QUERY = defineQuery(`
  *[_type == "venue" && (
    name match $search + "*" ||
    address.city match $search + "*" ||
    address.fullAddress match $search + "*"
  )] | order(name asc) {
    _id,
    name,
    "city": address.city,
    "fullAddress": address.fullAddress,
    "sessionCount": count(*[_type == "classSession" && references(^._id)])
  }
`);

export default async function VenuesPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams;
  const search = params.search || "";

  const { data: venues } = await sanityFetch({
    query: VENUES_QUERY,
    params: { search },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">
            Manage your studio locations and facilities.
          </p>
        </div>
      </div>

      <VenuesList venues={venues} />
    </div>
  );
}
