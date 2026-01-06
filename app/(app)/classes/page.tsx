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
  let [{ data: sessions }, { data: bookedSessionIds }] = await Promise.all([
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

  let isFallback = false;

  // Fallback to global search if no sessions found in radius
  if (!sessions || sessions.length === 0) {
    const globalResult = await sanityFetch({
      query: FILTERED_SESSIONS_QUERY,
      params: {
        minLat: -90,
        maxLat: 90,
        minLng: -180,
        maxLng: 180,
        venueId: "",
        categoryIds: [],
        tierLevels: [],
      },
    });
    if (globalResult.data && globalResult.data.length > 0) {
      sessions = globalResult.data;
      isFallback = true;
    }
  }

  // MOCK DATA FALLBACK
  // If database is completely empty, show mock data so user can see functionality
  if (!sessions || sessions.length === 0) {
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(10, 0, 0, 0);

    const nextDay2 = new Date();
    nextDay2.setDate(nextDay2.getDate() + 2);
    nextDay2.setHours(14, 0, 0, 0);

    sessions = [
      {
        _id: "mock-session-1",
        startTime: nextDay.toISOString(),
        maxCapacity: 20,
        status: "scheduled",
        currentBookings: 5,
        activity: {
          _id: "mock-activity-1",
          name: "Vinyasa Flow Yoga (Demo)",
          slug: { current: "vinyasa-flow-demo", _type: "slug" },
          instructor: "Sarah Instructor",
          duration: 60,
          tierLevel: 1,
          category: { _id: "cat-yoga", name: "Yoga", slug: { current: "yoga", _type: "slug" } }
        },
        venue: {
          _id: "mock-venue-1",
          name: "Central Studio",
          slug: { current: "central-studio", _type: "slug" },
          city: "New York",
          address: {
            lat: 40.7128,
            lng: -74.0060,
            fullAddress: "123 Broadway, New York, NY"
          }
        }
      },
      {
        _id: "mock-session-2",
        startTime: nextDay2.toISOString(),
        maxCapacity: 15,
        status: "scheduled",
        currentBookings: 12,
        activity: {
          _id: "mock-activity-2",
          name: "HIIT Blast (Demo)",
          slug: { current: "hiit-blast-demo", _type: "slug" },
          instructor: "Mike Trainer",
          duration: 45,
          tierLevel: 2,
          category: { _id: "cat-hiit", name: "HIIT", slug: { current: "hiit", _type: "slug" } }
        },
        venue: {
          _id: "mock-venue-2",
          name: "Downtown Gym",
          slug: { current: "downtown-gym", _type: "slug" },
          city: "New York",
          address: {
            lat: 40.7238,
            lng: -74.0060,
            fullAddress: "456 Main St, New York, NY"
          }
        }
      }
    ] as any;
    isFallback = true;
  }

  const sessionsList = (sessions || []) as FILTERED_SESSIONS_QUERYResult;
  let filteredSessions: Session[] = [];

  if (!isFallback && userPreferences?.location?.lat && userPreferences?.location?.lng && userPreferences?.searchRadius) {
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
