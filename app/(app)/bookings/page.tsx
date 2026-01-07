import { auth } from "@clerk/nextjs/server";
import { sanityFetch } from "@/sanity/lib/live";
import { USER_BOOKINGS_QUERY } from "@/sanity/lib/queries/bookings";
import { isPast } from "date-fns";
import { redirect } from "next/navigation";
import { BookingsContent } from "@/components/app/bookings/BookingsContent";
import { getUserTier } from "@/lib/subscription-server";
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
import type { USER_BOOKINGS_QUERYResult } from "@/sanity.types";

// Use Sanity-generated Booking type
type Booking = USER_BOOKINGS_QUERYResult[number];

export default async function BookingsPage() {
  // Authenticate user
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // ✅ Fetch bookings (NO generic here)
  const { data } = await sanityFetch({
    query: USER_BOOKINGS_QUERY,
    params: { clerkId: userId },
  });

  // ✅ Cast ONCE to Sanity type
  const bookings = data as USER_BOOKINGS_QUERYResult;

  // ✅ Fetch user tier to pass to client component
  const userTier = await getUserTier(userId);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-gradient-to-r from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Badge className="mb-4 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
            Activity Dashboard
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">My Bookings</h1>
          <p className="text-muted-foreground mt-4 text-lg max-w-2xl">
            Track your fitness journey, manage upcoming sessions, and celebrate your progress.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12">
        <BookingsContent initialBookings={bookings} userTier={userTier} />
      </main>
    </div>
  );
}
