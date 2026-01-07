import { FILTERED_SESSIONS_QUERYResult } from "@/sanity.types";
import { addDays, setHours, setMinutes, format } from "date-fns";

// Types derived from Sanity but simplified for mock usage
export type MockSession = FILTERED_SESSIONS_QUERYResult[number] & {
    distance?: number;
};

export const MOCK_CATEGORIES = [
    { _id: "cat-yoga", name: "Yoga", slug: "yoga" },
    { _id: "cat-hiit", name: "HIIT", slug: "hiit" },
    { _id: "cat-cycling", name: "Cycling", slug: "cycling" },
    { _id: "cat-pilates", name: "Pilates", slug: "pilates" },
    { _id: "cat-strength", name: "Strength", slug: "strength" },
];

export const MOCK_VENUES = [
    {
        _id: "venue-central",
        name: "Central Studio",
        city: "London",
        address: {
            lat: 51.5074,
            lng: -0.1278,
            fullAddress: "100 Oxford St, London, UK",
        },
        amenities: ["Showers", "Changing Rooms", "Water Station"],
    },
    {
        _id: "venue-west",
        name: "West End Wellness",
        city: "London",
        address: {
            lat: 51.5123,
            lng: -0.1456,
            fullAddress: "50 Regent St, London, UK",
        },
        amenities: ["Juice Bar", "Sauna", "Towels Provided"],
    },
    {
        _id: "venue-east",
        name: "The East Hub",
        city: "London",
        address: {
            lat: 51.5245,
            lng: -0.0789,
            fullAddress: "20 Shoreditch High St, London, UK",
        },
        amenities: ["Lockers", "Coffee Shop"],
    },
];

export const MOCK_ACTIVITIES = [
    {
        name: "Vinyasa Flow Yoga",
        instructor: "Sarah Jenkins",
        duration: 60,
        category: MOCK_CATEGORIES[0],
        tierLevel: "basic",
        difficulty: "Beginner",
        videoUrl: "https://www.youtube.com/watch?v=A0X0p9H6-S0",
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "HIIT Blast",
        instructor: "Mike Ross",
        duration: 45,
        category: MOCK_CATEGORIES[1],
        tierLevel: "performance",
        difficulty: "Advanced",
        videoUrl: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
        imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Morning Cycling",
        instructor: "Emma Wilson",
        duration: 50,
        category: MOCK_CATEGORIES[2],
        tierLevel: "basic",
        difficulty: "Intermediate",
        videoUrl: "https://www.youtube.com/watch?v=v7AYKMP6rOE",
        imageUrl: "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Core Pilates",
        instructor: "David Chen",
        duration: 60,
        category: MOCK_CATEGORIES[3],
        tierLevel: "performance",
        difficulty: "Intermediate",
        videoUrl: "https://www.youtube.com/watch?v=K-PpDQX7JpI",
        imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    },
    {
        name: "Power Strength",
        instructor: "Alex Hunter",
        duration: 75,
        category: MOCK_CATEGORIES[4],
        tierLevel: "champion",
        difficulty: "Advanced",
        videoUrl: "https://www.youtube.com/watch?v=p49vW6p72fM",
        imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
    },
];

export function generateMockSessions(): MockSession[] {
    const sessions: MockSession[] = [];
    const now = new Date();

    // Generate sessions for the next 7 days
    for (let i = 0; i < 7; i++) {
        const day = addDays(now, i);

        MOCK_VENUES.forEach((venue, venueIdx) => {
            // Each venue has 3-5 sessions per day
            const sessionCount = 3 + (venueIdx % 3);

            for (let j = 0; j < sessionCount; j++) {
                const activity = MOCK_ACTIVITIES[(venueIdx + j) % MOCK_ACTIVITIES.length];
                const hour = 7 + (j * 3); // 7 AM, 10 AM, 1 PM, 4 PM, etc.
                const startTime = setMinutes(setHours(day, hour), 0);

                sessions.push({
                    _id: `mock-session-${i}-${venueIdx}-${j}`,
                    startTime: startTime.toISOString(),
                    maxCapacity: 20 + (venueIdx * 5),
                    currentBookings: 5 + (j * 2),
                    status: "scheduled",
                    activity: {
                        _id: `mock-act-${j}`,
                        name: activity.name,
                        instructor: activity.instructor,
                        duration: activity.duration,
                        tierLevel: activity.tierLevel as any,
                        videoUrl: (activity as any).videoUrl,
                        image: activity.imageUrl, // Map mock image URL
                        category: {
                            _id: activity.category._id,
                            name: activity.category.name,
                            slug: { _type: "slug", current: activity.category.slug }
                        }
                    },
                    venue: {
                        _id: venue._id,
                        name: venue.name,
                        city: venue.city,
                        address: venue.address as any,
                        slug: { _type: "slug", current: venue.name.toLowerCase().replace(/ /g, "-") }
                    }
                } as any);
            }
        });
    }

    return sessions;
}

// Local Storage Booking Simulation
const BOOKINGS_KEY = "virexa_bookings";

export function getLocalBookings(): string[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(BOOKINGS_KEY);
    return stored ? JSON.parse(stored) : [];
}

export function saveLocalBooking(sessionId: string) {
    const bookings = getLocalBookings();
    if (!bookings.includes(sessionId)) {
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify([...bookings, sessionId]));
    }
}

export function removeLocalBooking(sessionId: string) {
    const bookings = getLocalBookings();
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings.filter(id => id !== sessionId)));
}
