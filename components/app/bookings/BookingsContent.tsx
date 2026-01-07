"use client";

import { useEffect, useState } from "react";
import { getLocalBookings, generateMockSessions } from "@/lib/mock-data";
import { BookingCard } from "./BookingCard";
import { isPast, format, startOfMonth, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttendanceAlert } from "./AttendanceAlert";
import { BookingsCalendarView } from "./BookingCalenderView";
import { getUsageStats } from "@/lib/subscription";
import type { USER_BOOKINGS_QUERYResult } from "@/sanity.types";
import type { Tier } from "@/lib/constants/subscription";
import { Trophy, TrendingUp, Calendar, Clock, Sparkles } from "lucide-react";

type Booking = USER_BOOKINGS_QUERYResult[number];

interface BookingsContentProps {
    initialBookings: Booking[];
    userTier: Tier | null;
}

export function BookingsContent({ initialBookings, userTier }: BookingsContentProps) {
    const [allBookings, setAllBookings] = useState<any[]>(initialBookings);
    const [loading, setLoading] = useState(true);
    const [usageStats, setUsageStats] = useState<any>(null);

    useEffect(() => {
        const localIds = getLocalBookings();
        const mockSessions = generateMockSessions();
        const localBookings = localIds.map(id => {
            const session = mockSessions.find(s => s._id === id);
            if (!session) return null;
            return {
                _id: id,
                status: "confirmed",
                classSession: session,
                isMock: true
            };
        }).filter((b): b is any => b !== null);

        const merged = [...initialBookings, ...localBookings];
        // De-dupe if necessary
        const uniqueMerged = Array.from(new Map(merged.map(b => [b._id, b])).values());

        setAllBookings(uniqueMerged);

        // Calculate usage stats client-side now that we have merged data
        const fetchStats = async () => {
            const stats = await getUsageStats(userTier ?? "basic", uniqueMerged.length);
            setUsageStats(stats);
        };
        fetchStats();

        setLoading(false);
    }, [initialBookings, userTier]);

    const upcoming = allBookings.filter(b =>
        b.status === "confirmed" &&
        b.classSession?.startTime &&
        !isPast(new Date(b.classSession.startTime))
    ).sort((a, b) => new Date(a.classSession.startTime).getTime() - new Date(b.classSession.startTime).getTime());

    const past = allBookings.filter(b =>
        b.status === "attended" ||
        (b.classSession?.startTime && isPast(new Date(b.classSession.startTime)))
    ).sort((a, b) => new Date(b.classSession.startTime).getTime() - new Date(a.classSession.startTime).getTime());

    // Progress Calculation
    const monthlyGoal = 12;
    const currentMonthStart = startOfMonth(new Date());
    const currentMonthEnd = endOfMonth(new Date());

    const completedThisMonth = allBookings.filter(b => {
        const date = new Date(b.classSession?.startTime || 0);
        return (b.status === "attended" || (b.status === "confirmed" && isPast(date))) &&
            date >= currentMonthStart && date <= currentMonthEnd;
    }).length;

    const progressPercent = Math.min((completedThisMonth / monthlyGoal) * 100, 100);

    return (
        <div className="space-y-10">
            {/* RESTORED: Attendance Alert */}
            <AttendanceAlert bookings={allBookings} />

            {/* RESTORED: Calendar View */}
            <section>
                <div className="mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Calendar View</h2>
                </div>
                <BookingsCalendarView bookings={allBookings} />
            </section>

            {/* Progress Section */}
            <section className="grid gap-6 md:grid-cols-2">
                <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-md">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Trophy className="h-5 w-5 text-primary" />
                                Monthly Progress
                            </CardTitle>
                            <Badge variant="outline" className="font-bold border-primary/30 text-primary">
                                {completedThisMonth} / {monthlyGoal} Classes
                            </Badge>
                        </div>
                        <CardDescription>You&apos;re doing great! Keep it up.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted shadow-inner">
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white mix-blend-difference">
                                {Math.round(progressPercent)}%
                            </div>
                        </div>
                        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                            <span>Start</span>
                            <span>Goal: {monthlyGoal} Classes</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Performance Tracker
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 pt-4">
                        <div className="rounded-xl bg-muted p-4 border border-border/50">
                            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Total Sessions</p>
                            <p className="text-3xl font-black mt-1">{allBookings.length}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                            <p className="text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Successfully Completed</p>
                            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{past.length}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* RESTORED/MODIFIED: Usage Stats */}
                {usageStats && usageStats.tier !== "champion" && (
                    <Card className="md:col-span-2 border-primary/10">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Plan Usage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-3">
                                <Badge variant="secondary" className="capitalize">
                                    {usageStats.tier} Tier
                                </Badge>
                                <span className="font-semibold">
                                    {usageStats.limit === Infinity
                                        ? `${usageStats.used} classes used`
                                        : `${usageStats.used} / ${usageStats.limit} classes`}
                                </span>
                            </div>
                            {usageStats.limit !== Infinity && (
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary"
                                        style={{
                                            width: `${Math.min((usageStats.used / usageStats.limit) * 100, 100)}%`,
                                        }}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* Upcoming Section */}
            <section>
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Upcoming Classes</h2>
                        <p className="text-sm text-muted-foreground">{upcoming.length} sessions scheduled</p>
                    </div>
                </div>

                {upcoming.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed p-10 text-center">
                        <p className="text-muted-foreground">No upcoming classes. Ready to sweat?</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                        {upcoming.map((booking) => (
                            <BookingCard key={booking._id} booking={booking} showActions={true} />
                        ))}
                    </div>
                )}
            </section>

            {/* History Section */}
            <section>
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <Clock className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Track Record & Completion</h2>
                        <p className="text-sm text-muted-foreground">Detailed history of your fitness journey and achievements</p>
                    </div>
                </div>

                {past.length === 0 ? (
                    <div className="rounded-2xl border bg-muted/30 p-8 text-center">
                        <p className="text-muted-foreground">Your history will appear here once you complete a class.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {past.map((booking) => (
                            <BookingCard key={booking._id} booking={booking} showActions={false} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
