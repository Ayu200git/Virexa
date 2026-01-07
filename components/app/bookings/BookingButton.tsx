"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking, cancelBooking } from "@/lib/actions/booking";
import Link from "next/link";
import { CheckCircle, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tier } from "@/lib/constants/subscription";
import {
  TIER_HIERARCHY,
  TIER_DISPLAY_NAMES,
} from "@/lib/constants/subscription";
import { saveLocalBooking, removeLocalBooking, getLocalBookings } from "@/lib/mock-data";
import { useEffect } from "react";

interface BookingButtonProps {
  sessionId: string;
  tierLevel: string;
  isFullyBooked: boolean;
  userTier: Tier | null;
  existingBookingId: string | null;
}

export function BookingButton({
  sessionId,
  tierLevel,
  isFullyBooked,
  userTier,
  existingBookingId,
}: BookingButtonProps) {
  const { isSignedIn, isLoaded } = useUser();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isMockBooked, setIsMockBooked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (sessionId.startsWith("mock-")) {
      const localBookings = getLocalBookings();
      setIsMockBooked(localBookings.includes(sessionId));
    }
  }, [sessionId]);

  const canAccess =
    userTier !== null &&
    TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[tierLevel as Tier];

  const requiredTier = tierLevel as Tier;
  const requiredTierName = TIER_DISPLAY_NAMES[requiredTier] || tierLevel;

  const handleBook = () => {
    setError(null);

    // MOCK BOOKING HANDLING
    if (sessionId.startsWith("mock-")) {
      startTransition(async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        saveLocalBooking(sessionId);
        setIsMockBooked(true);
        setError("✅ Demo: Class booked! This is stored in your browser.");
        window.dispatchEvent(new CustomEvent("virexa-booking-updated"));
        router.refresh(); // Update parent if needed
      });
      return;
    }

    startTransition(async () => {
      const result = await createBooking(sessionId);

      if (!result.success) {
        setError(result.error || "Failed to book class");
        return;
      }

      // After successful booking, stay on or redirect to class page to show the video/details
      router.refresh();
    });
  };

  const handleCancel = () => {
    if (!existingBookingId && !isMockBooked) return;
    setError(null);

    if (sessionId.startsWith("mock-")) {
      startTransition(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        removeLocalBooking(sessionId);
        setIsMockBooked(false);
        setIsCancelled(true);
        window.dispatchEvent(new CustomEvent("virexa-booking-updated"));
        router.refresh();
      });
      return;
    }

    startTransition(async () => {
      const result = await cancelBooking(existingBookingId!);

      if (!result.success) {
        setError(result.error || "Failed to cancel booking");
        return;
      }

      setIsCancelled(true);
      router.refresh();
    });
  };

  if (!isLoaded) {
    return (
      <Button disabled className="h-12 w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  // user has booking
  if ((existingBookingId || isMockBooked) && !isCancelled) {
    return (
      <div className="space-y-3">
        <div className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-3 text-center text-sm font-semibold text-primary">
          <CheckCircle className="h-4 w-4" />
          You&apos;re Booked!
        </div>
        <Button
          asChild
          className="h-12 w-full bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg gap-2"
        >
          <a href="#video-section">
            <Play className="h-4 w-4 fill-current" />
            Watch Recording
          </a>
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
          className="h-10 w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cancelling...
            </>
          ) : (
            "Cancel Booking"
          )}
        </Button>
        {error && (
          <p className="text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">{error}</p>
        )}
        <Link
          href="/bookings"
          className="block text-center text-sm text-muted-foreground transition-colors hover:text-primary underline underline-offset-4"
        >
          View My Bookings →
        </Link>
      </div>
    );
  }

  if (isFullyBooked) {
    return (
      <Button disabled className="h-12 w-full">
        Class is Full
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button className="h-12 w-full">Sign in to Book</Button>
      </SignInButton>
    );
  }

  // signed in user without subscription
  if (userTier === null) {
    return (
      <div className="space-y-2">
        <Button asChild className="h-12 w-full">
          <Link href={`/upgrade?required=${tierLevel}&sessionId=${sessionId}`}>
            Subscribe to Book
          </Link>
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Choose a plan to start booking classes
        </p>
      </div>
    );
  }
  if (!canAccess) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 dark:from-amber-950/20 dark:to-orange-950/20 dark:border-amber-900/30">
          <p className="text-center text-sm font-medium text-amber-800 dark:text-amber-200 mb-4">
            This is a <span className="font-bold underline decoration-amber-500/30">{requiredTierName}</span> tier class. Upgrade your plan to get instant access!
          </p>
          <Button
            asChild
            className="h-12 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:via-orange-600 hover:to-amber-700 text-white font-bold shadow-[0_4px_20px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] border-none"
          >
            <Link href={`/upgrade?required=${tierLevel}&sessionId=${sessionId}`}>
              Upgrade to {requiredTierName}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={handleBook} disabled={isPending} className="h-12 w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Booking...
          </>
        ) : (
          "Book This Class"
        )}
      </Button>
      {error && (
        <p className="text-center text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

