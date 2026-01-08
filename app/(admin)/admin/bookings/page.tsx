import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { BookingsList } from "./BookingsList";

const BOOKINGS_QUERY = defineQuery(`
  *[_type == "booking" && (
    user->name match $search + "*" ||
    user->email match $search + "*" ||
    classSession->activity->name match $search + "*"
  )] | order(classSession->startTime desc) {
    _id,
    "userName": user->name,
    "userEmail": user->email,
    "activityName": classSession->activity->name,
    "startTime": classSession->startTime,
    status
  }
`);

export default async function BookingsPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams;
  const search = params.search || "";

  const { data: bookings } = await sanityFetch({
    query: BOOKINGS_QUERY,
    params: { search },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage recent bookings and attendance.
          </p>
        </div>
      </div>

      <BookingsList bookings={bookings} />
    </div>
  );
}
