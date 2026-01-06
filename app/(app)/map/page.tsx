import { sanityFetch } from "@/sanity/lib/live";
import { UPCOMING_SESSIONS_QUERY } from "@/sanity/lib/queries/sessions";
import { auth } from "@clerk/nextjs/server";
import { MapClient } from "@/components/app/maps/MapClient";
import { getUserPreferences } from "@/lib/actions/profile";
import { UPCOMING_SESSIONS_QUERYResult } from "@/sanity.types";

export default async function MapPage() {
    const { userId } = await auth();

    // Get user preferences (location and search radius)
    const userPreferences = userId ? await getUserPreferences() : null;

    // Fetch upcoming sessions to get venue locations
    const { data: sessions } = await sanityFetch({
        query: UPCOMING_SESSIONS_QUERY,
    });

    // Extract venues from sessions and filter out duplicates and those without coordinates
    const venues = (sessions || [])
        .map((session: UPCOMING_SESSIONS_QUERYResult[number]) => session.venue)
        .filter((venue: UPCOMING_SESSIONS_QUERYResult[number]["venue"]): venue is NonNullable<UPCOMING_SESSIONS_QUERYResult[number]["venue"]> =>
            !!venue &&
            venue.address?.lat != null &&
            venue.address?.lng != null
        );

    // Default to London if no user location
    const userLocation = {
        lat: userPreferences?.location?.lat ?? 51.5074,
        lng: userPreferences?.location?.lng ?? -0.1278,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <MapClient
                venues={venues}
                userLocation={userLocation}
            />
        </div>
    );
}
