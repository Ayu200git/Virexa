import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { ActivitiesList } from "./ActivitiesList";

const ACTIVITIES_QUERY = defineQuery(`
  *[_type == "activity" && (
    name match $search + "*" ||
    instructor match $search + "*" ||
    category->name match $search + "*"
  )] | order(name asc) {
    _id,
    name,
    instructor,
    tierLevel,
    "categoryName": category->name,
    "sessionCount": count(*[_type == "classSession" && references(^._id)])
  }
`);

export default async function ActivitiesPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams;
  const search = params.search || "";

  const { data: activities } = await sanityFetch({
    query: ACTIVITIES_QUERY,
    params: { search },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">
            Manage your fitness class types and categories.
          </p>
        </div>
      </div>

      <ActivitiesList activities={activities} />
    </div>
  );
}
