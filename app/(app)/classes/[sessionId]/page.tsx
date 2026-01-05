import { sanityFetch } from "@/sanity/lib/live";
import { SESSION_BY_ID_QUERY } from "@/sanity/lib/queries/sessions";
import { USER_SESSION_BOOKING_QUERY } from "@/sanity/lib/queries/bookings";
import { urlFor } from "@/sanity/lib/image";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookingButton } from "@/components/app/bookings/BookingButton";
import { VenueMap } from "@/components/app/maps/venueMap";
import { PortableText } from "@portabletext/react";
import { getUserTier, getUserTierInfo } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import {
  ChevronRight,
  Calendar,
  Clock,
  User,
  Users,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIER_COLORS } from "@/lib/constants/subscription";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ClassDetailPage({ params }: PageProps) {
  const { sessionId } = await params;
  const { userId } = await auth();

  // ✅ Get user tier (string or null)
  const userTier = userId ? await getUserTier(userId) : null;

  const [{ data: session }, { data: existingBooking }] = await Promise.all([
    sanityFetch({
      query: SESSION_BY_ID_QUERY,
      params: { sessionId },
    }),
    userId
      ? sanityFetch({
          query: USER_SESSION_BOOKING_QUERY,
          params: { clerkId: userId, sessionId },
        })
      : Promise.resolve({ data: null }),
  ]);

  if (!session || !session.startTime) {
    notFound();
  }

  // ✅ Call getUserTierInfo ONLY if tier exists
  const tierInfo = userTier ? getUserTierInfo(userTier) : null;

  const maxCapacity = session.maxCapacity ?? 0;
  const spotsRemaining = maxCapacity - session.currentBookings;
  const isFullyBooked = spotsRemaining <= 0;
  const startDate = new Date(session.startTime);
  const activity = session.activity;
  const venue = session.venue;

  // ✅ Safe key for TIER_COLORS
  const tierLevel = (activity?.tierLevel ?? "basic") as keyof typeof TIER_COLORS;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm">
          <Link href="/classes" className="text-muted-foreground hover:text-primary">
            Classes
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {activity?.name ?? "Class"}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
              {activity?.images?.[0] ? (
                <Image
                  src={urlFor(activity.images[0]).width(800).height(450).url()}
                  alt={activity.name ?? "Class"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No image
                </div>
              )}

              {/* Tier Badge */}
              <Badge
                className={`absolute left-4 top-4 ${TIER_COLORS[tierLevel]} border-0`}
              >
                {tierLevel.charAt(0).toUpperCase() + tierLevel.slice(1)} Tier
              </Badge>
            </div>

            {/* Image Gallery */}
            {activity?.images && activity.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {activity.images.slice(1).map((image: any, i: number) =>
                  image?.asset?._ref ? (
                    <div
                      key={image.asset._ref}
                      className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted"
                    >
                      <Image
                        src={urlFor(image).width(96).height(96).url()}
                        alt={`${activity.name ?? "Class"} ${i + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : null
                )}
              </div>
            )}

            {/* Venue */}
            {venue && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" /> Venue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {venue.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities.map((amenity: string) => (
                        <Badge key={amenity} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="space-y-4">
                <BookingButton
                  sessionId={session._id}
                  tierLevel={tierLevel}
                  isFullyBooked={isFullyBooked}
                  userTier={tierInfo?.tier ?? null}
                  existingBookingId={existingBooking?._id ?? null}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
