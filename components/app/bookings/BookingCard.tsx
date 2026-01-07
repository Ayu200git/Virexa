"use client";

import Link from "next/link";
import NextImage from "next/image";
import { format, addHours, isPast, isWithinInterval } from "date-fns";
import { urlFor } from "@/sanity/lib/image";
import { BookingActions } from "./BookingActions";
import {
  BOOKING_STATUS_COLORS,
  getStatusLabel,
  getEffectiveStatus,
} from "@/lib/constants/status";
import type { USER_BOOKINGS_QUERYResult } from "@/sanity.types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Sparkles, Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VideoPlayer } from "../classes/VideoPlayer";

type Booking = USER_BOOKINGS_QUERYResult[number];

interface BookingCardProps {
  booking: Booking;
  showActions: boolean;
}

export function BookingCard({ booking, showActions }: BookingCardProps) {
  const startTime = booking.classSession?.startTime;
  if (!startTime) return null;

  const sessionStart = new Date(startTime);
  const duration = booking.classSession?.activity?.duration ?? 60;
  const sessionEnd = addHours(sessionStart, duration / 60);
  const attendanceWindowEnd = addHours(sessionEnd, 1);
  const now = new Date();

  const canConfirmAttendance =
    booking.status === "confirmed" &&
    isWithinInterval(now, { start: sessionStart, end: attendanceWindowEnd });

  const effectiveStatus = getEffectiveStatus(
    booking.status ?? "confirmed",
    sessionStart,
    duration
  );

  const activity = booking.classSession?.activity;
  const venue = booking.classSession?.venue;

  return (
    <Card
      className={`group transition-all duration-300 hover:shadow-lg hover:border-primary/30 ${showActions ? "" : "opacity-75"
        }`}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <Link
            href={`/classes/${booking.classSession?._id}`}
            className="flex min-w-0 flex-1 gap-4"
          >
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-muted border border-border/50 shadow-inner">
              {activity?.image ? (
                <NextImage
                  src={typeof activity.image === 'string' ? activity.image : urlFor(activity.image).width(112).height(112).url()}
                  alt={activity.name ?? "Class"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-background p-4 text-center">
                  <Sparkles className="h-6 w-6 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold transition-colors group-hover:text-primary">
                {activity?.name ?? "Unknown Class"}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {venue?.name ?? "Unknown Venue"}
                {venue?.city && ` • ${venue.city}`}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {format(sessionStart, "EEE, MMM d")}
                <span className="mx-1">•</span>
                <Clock className="h-3.5 w-3.5" />
                {format(sessionStart, "h:mm a")}
                <span className="mx-1">•</span>
                {duration} min
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 flex-col items-end justify-center gap-2">
            <div className="flex items-center gap-2">
              {effectiveStatus === "attended" && (
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 gap-1 px-2">
                  <span className="text-[10px]">✓</span> Completed
                </Badge>
              )}
              <Badge
                className={`${BOOKING_STATUS_COLORS[effectiveStatus] ?? BOOKING_STATUS_COLORS.confirmed}`}
              >
                {getStatusLabel(effectiveStatus)}
              </Badge>
            </div>

            {activity?.videoUrl && (effectiveStatus === "confirmed" || effectiveStatus === "attended") && (
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-xs font-bold text-primary-foreground shadow-md transition-all hover:scale-105 hover:bg-primary/90 active:scale-95"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px]">
                      ▶
                    </div>
                    Watch Video
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-primary/20 sm:rounded-3xl">
                  <DialogHeader className="absolute top-4 left-6 z-10 text-white drop-shadow-md pointer-events-none">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <Play className="h-5 w-5 fill-primary text-primary" />
                      {activity?.name}
                    </DialogTitle>
                  </DialogHeader>
                  <VideoPlayer videoUrl={activity.videoUrl} className="border-0 rounded-none shadow-none" />
                </DialogContent>
              </Dialog>
            )}

            {showActions && (
              <BookingActions
                bookingId={booking._id}
                canConfirmAttendance={canConfirmAttendance}
                isPast={isPast(sessionStart)}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

