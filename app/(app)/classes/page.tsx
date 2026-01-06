import { sanityFetch } from "@/sanity/lib/live";
import { FILTERED_SESSIONS_QUERY } from "@/sanity/lib/queries/sessions";
import { USER_BOOKED_SESSION_IDS_QUERY } from "@/sanity/lib/queries/bookings";
import { auth } from "@clerk/nextjs/server";
import { ClassesContent } from "@/components/app/classes/ClassesContent";
import { format } from "date-fns";
import { FILTERED_SESSIONS_QUERYResult } from "@/sanity.types";
import { getUserPreferences } from "@/lib/actions/profile";
import { getBoundingBox } from "@/lib/utils/distance";

type Session = FILTERED_SESSIONS_QUERYResult[number] & { distance: number };

export default async function ClassesPage() {
  const { userId } = await auth();

  // Get user preferences (location and search radius)
  const userPreferences = userId ? await getUserPreferences() : null;

  // Calculate bounding box for location filtering
  // If no user location, use a very wide bounding box (essentially no filter)
  let boundingBox = {
    minLat: -90,
    maxLat: 90,
    minLng: -180,
    maxLng: 180,
  };

  if (userPreferences?.location?.lat && userPreferences?.location?.lng) {
    const radiusKm = userPreferences.searchRadius || 50; // Default to 50km if not set
    boundingBox = getBoundingBox(
      userPreferences.location.lat,
      userPreferences.location.lng,
      radiusKm
    );
  }

  // Fetch data in parallel
  const [{ data: sessions }, { data: bookedSessionIds }] = await Promise.all([
    sanityFetch({
      query: FILTERED_SESSIONS_QUERY,
      params: {
        minLat: boundingBox.minLat,
        maxLat: boundingBox.maxLat,
        minLng: boundingBox.minLng,
        maxLng: boundingBox.maxLng,
        venueId: "", // No venue filter
        categoryIds: [], // No category filter
        tierLevels: [], // No tier filter
      },
    }),
    userId
      ? sanityFetch({
        query: USER_BOOKED_SESSION_IDS_QUERY,
        params: { clerkId: userId },
      })
      : Promise.resolve({ data: [] }),
  ]);

  // Filter sessions by distance if user has location
  let filteredSessions: Session[] = [];
  const sessionsList = (sessions || []) as FILTERED_SESSIONS_QUERYResult;

  if (userPreferences?.location?.lat && userPreferences?.location?.lng && userPreferences?.searchRadius) {
    const { filterSessionsByDistance } = await import("@/lib/utils/distance");
    // Filter out sessions without startTime or venue address before filtering by distance
    const validSessions = sessionsList.filter(
      (s) => s.startTime && s.venue?.address?.lat != null && s.venue?.address?.lng != null
    );
    const filtered = filterSessionsByDistance(
      validSessions as any,
      userPreferences.location.lat,
      userPreferences.location.lng,
      userPreferences.searchRadius
    );
    filteredSessions = filtered as Session[];
  } else {
    // If no location, add placeholder distance
    filteredSessions = sessionsList.map((session): Session => ({
      ...session,
      distance: 0,
    }));
  }

  // Group sessions by day (YYYY-MM-DD or ISO date string key)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedSessions = filteredSessions.reduce((acc: any, session) => {
    if (!session.startTime) return acc;

    const dateKey = format(new Date(session.startTime), "yyyy-MM-dd");

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(session);
    return acc;
  }, {});

  // Convert to array of [key, values] tuples and sort by date
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groupedSessionsArray = Object.entries(groupedSessions).sort(([a], [b]) =>
    a.localeCompare(b)
  ) as any;

  // Filter booked session IDs to remove nulls and satisfy TypeScript
  const sessionIds = (bookedSessionIds || []).filter((id: string | null): id is string => id !== null) as string[];

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <ClassesContent
          groupedSessions={groupedSessionsArray}
          bookedSessionIds={sessionIds}
        />
      </main>
    </div>
  );
}
