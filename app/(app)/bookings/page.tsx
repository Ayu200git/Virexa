<<<<<<< HEAD
 import { auth } from "@clerk/nextjs/server";
=======
import { auth } from "@clerk/nextjs/server";
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
import { sanityFetch } from "@/sanity/lib/live";
import { USER_BOOKINGS_QUERY } from "@/sanity/lib/queries/bookings";
import { isPast } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookingsCalendarView } from "@/components/app/bookings/BookingCalenderView";
import { AttendanceAlert } from "@/components/app/bookings/AttendanceAlert";
import { BookingCard } from "@/components/app/bookings/BookingCard";
import { getUsageStats, getUserTier } from "@/lib/subscription";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
<<<<<<< HEAD
import type { USER_BOOKINGS_QUERYResult } from "@/sanity.types";

// Use Sanity-generated Booking type
type Booking = USER_BOOKINGS_QUERYResult[number];

export default async function BookingsPage() {
  // Authenticate user
  const { userId } = await auth();
=======

export default async function BookingsPage() {
  const { userId } = await auth();

>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
  if (!userId) {
    redirect("/sign-in");
  }

<<<<<<< HEAD
  // ✅ Fetch bookings (NO generic here)
  const { data } = await sanityFetch({
    query: USER_BOOKINGS_QUERY,
    params: { clerkId: userId },
  });

  // ✅ Cast ONCE to Sanity type
  const bookings = data as USER_BOOKINGS_QUERYResult;

  // Get user subscription info
  const userTier = await getUserTier(userId);
  const usedBookings = bookings.length;
  const usageStats = await getUsageStats(userTier, usedBookings);

  // Filter out invalid bookings
  const validBookings = bookings.filter(
    (b: Booking) => Boolean(b.status && b.classSession?.startTime)
  );

  // Upcoming bookings (earliest first)
  const upcomingBookings = validBookings
    .filter(
      (b: Booking) =>
        b.status === "confirmed" &&
        b.classSession?.startTime &&
        !isPast(new Date(b.classSession.startTime))
    )
    .sort((a: Booking, b: Booking) => {
=======
  const [{ data: bookings }, usageStats] = await Promise.all([
    sanityFetch({ query: USER_BOOKINGS_QUERY, params: { clerkId: userId } }),
    getUsageStats(userId),
  ]);

  // Filter out bookings with invalid data
  const validBookings = bookings.filter(
    (b) => b.status && b.classSession?.startTime,
  );

  // Sort upcoming bookings (earliest first)
  const upcomingBookings = validBookings
    .filter(
      (b) =>
        b.status === "confirmed" &&
        b.classSession?.startTime &&
        !isPast(new Date(b.classSession.startTime)),
    )
    .sort((a, b) => {
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
      const aTime = a.classSession?.startTime
        ? new Date(a.classSession.startTime).getTime()
        : 0;
      const bTime = b.classSession?.startTime
        ? new Date(b.classSession.startTime).getTime()
        : 0;
      return aTime - bTime;
    });

<<<<<<< HEAD
  // Past bookings (most recent first)
  const pastBookings = validBookings
    .filter(
      (b: Booking) =>
        b.status !== "confirmed" ||
        (b.classSession?.startTime &&
          isPast(new Date(b.classSession.startTime)))
    )
    .sort((a: Booking, b:Booking) => {
=======
  // Sort past bookings (most recent first)
  const pastBookings = validBookings
    .filter(
      (b) =>
        b.status !== "confirmed" ||
        (b.classSession?.startTime &&
          isPast(new Date(b.classSession.startTime))),
    )
    .sort((a, b) => {
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
      const aTime = a.classSession?.startTime
        ? new Date(a.classSession.startTime).getTime()
        : 0;
      const bTime = b.classSession?.startTime
        ? new Date(b.classSession.startTime).getTime()
        : 0;
      return bTime - aTime;
    });

  return (
    <div className="min-h-screen bg-background">
<<<<<<< HEAD
=======
      {/* Page Header */}
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
      <div className="border-b bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your upcoming and past fitness classes
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
<<<<<<< HEAD
        {/* ✅ Correct prop */}
=======
        {/* Attendance Confirmation Alert */}
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
        <AttendanceAlert bookings={bookings} />

        {/* Calendar View */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Calendar View</h2>
          </div>
          <BookingsCalendarView bookings={bookings} />
        </section>

        {/* Upcoming Bookings */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Upcoming Classes</h2>
            <Badge variant="secondary" className="ml-2">
              {upcomingBookings.length}
            </Badge>
          </div>
<<<<<<< HEAD

          {upcomingBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
=======
          {upcomingBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
                <p className="text-muted-foreground mb-4">
                  No upcoming classes
                </p>
                <Button asChild>
                  <Link href="/classes">
                    Browse classes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
<<<<<<< HEAD
              {upcomingBookings.map((booking: Booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  showActions
                />
=======
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} showActions />
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
              ))}
            </div>
          )}
        </section>

<<<<<<< HEAD
=======
        {/* Usage Stats - we dont show this if the user is on the champion tier as they have unlimited classes */}
        {usageStats.tier !== "champion" && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Monthly Usage
              </CardTitle>
              <CardDescription>
                Track your class attendance this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usageStats.tier ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="capitalize">
                      {usageStats.tier} Tier
                    </Badge>
                    <span className="font-semibold text-lg">
                      {usageStats.limit === Infinity
                        ? `${usageStats.used} classes used`
                        : `${usageStats.used} / ${usageStats.limit} classes`}
                    </span>
                  </div>
                  {usageStats.limit !== Infinity && (
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.min((usageStats.used / usageStats.limit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                  {usageStats.limit !== Infinity && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {usageStats.limit - usageStats.used > 0
                        ? `${usageStats.limit - usageStats.used} classes remaining this month`
                        : "You've used all your classes this month"}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">
                    No active subscription
                  </p>
                  <Button asChild>
                    <Link href="/upgrade">
                      View subscription plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
        {/* Past Bookings */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-muted-foreground">
              Past Classes
            </h2>
            <Badge variant="outline" className="ml-2">
              {pastBookings.length}
            </Badge>
          </div>
<<<<<<< HEAD

          {pastBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No past classes yet
                </p>
=======
          {pastBookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No past classes yet</p>
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
<<<<<<< HEAD
              {pastBookings.map((booking: Booking) => (
=======
              {pastBookings.map((booking) => (
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
