import { sanityFetch } from "@/sanity/lib/live";
import { FILTERED_SESSIONS_QUERY } from "@/sanity/lib/queries/sessions";
import { USER_BOOKED_SESSION_IDS_QUERY } from "@/sanity/lib/queries/bookings";
import { auth } from "@clerk/nextjs/server";
import { ClassesContent } from "@/components/app/classes/ClassesContent";
import { ClassesMapSidebar } from "@/components/app/maps/ClassesMapSidebar";
import { format } from "date-fns";
import { FILTERED_SESSIONS_QUERYResult } from "@/sanity.types";
import { getUserPreferences } from "@/lib/actions/profile";
import { getBoundingBox } from "@/lib/utils/distance";

type Session = FILTERED_SESSIONS_QUERYResult[number] & { distance: number };

export default async function ClassesPage() {
  const { userId } = await auth();

  // Get user preferences (location and search radius)
  const userPreferences = userId ? await getUserPreferences() : null;
  let boundingBox = {
    minLat: -90,
    maxLat: 90,
    minLng: -180,
    maxLng: 180,
  };

  const defaultLocation = { lat: 51.5074, lng: -0.1278 }; // London default
  const userLocation = {
    lat: userPreferences?.location?.lat ?? defaultLocation.lat,
    lng: userPreferences?.location?.lng ?? defaultLocation.lng,
  };

  if (userPreferences?.location?.lat != null && userPreferences?.location?.lng != null) {
    const radiusKm = userPreferences.searchRadius || 50;
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
        venueId: "",
        categoryIds: [],
        tierLevels: [],
      },
    }),
    userId
      ? sanityFetch({
        query: USER_BOOKED_SESSION_IDS_QUERY,
        params: { clerkId: userId },
      })
      : Promise.resolve({ data: [] }),
  ]);

  const sessionsList = (sessions || []) as FILTERED_SESSIONS_QUERYResult;
  let filteredSessions: Session[] = [];

  if (userPreferences?.location?.lat && userPreferences?.location?.lng && userPreferences?.searchRadius) {
    const { filterSessionsByDistance } = await import("@/lib/utils/distance");
    const sessionsWithCoords = sessionsList.filter(
      (s) => s.venue?.address?.lat != null && s.venue?.address?.lng != null
    );

    filteredSessions = filterSessionsByDistance(
      sessionsWithCoords as any,
      userPreferences.location.lat,
      userPreferences.location.lng,
      userPreferences.searchRadius
    ) as Session[];
  } else {
    filteredSessions = sessionsList.map((session): Session => ({
      ...session,
      distance: 0,
    }));
  }

  // Grouping logic remains the same
  const groupedSessions = filteredSessions.reduce((acc: any, session) => {
    if (!session.startTime) return acc;
    const dateKey = format(new Date(session.startTime), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(session);
    return acc;
  }, {});

  const groupedSessionsArray = Object.entries(groupedSessions).sort(([a], [b]) =>
    a.localeCompare(b)
  ) as any;

  const sessionIds = (bookedSessionIds || []).filter((id: string | null): id is string => id !== null) as string[];

  // Extract unique venues for the map
  const venues = Array.from(
    new Map(
      filteredSessions
        .map((s) => s.venue)
        .filter((v): v is NonNullable<typeof v> => !!v && v.address?.lat != null)
        .map((v) => [v._id, v])
    ).values()
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      <main className="flex-1 overflow-y-auto px-4 py-8 pointer-events-auto">
        <div className="container mx-auto">
          <ClassesContent
            groupedSessions={groupedSessionsArray}
            bookedSessionIds={sessionIds}
          />
        </div>
      </main>

      {/* Map Sidebar - Hidden on mobile, visible on lg screens */}
      <aside className="hidden lg:block lg:w-[400px] xl:w-[500px] border-l border-border sticky top-0 h-screen">
        <ClassesMapSidebar
          venues={venues as any}
          userLocation={userLocation}
        />
      </aside>
    </div>
  );
}
