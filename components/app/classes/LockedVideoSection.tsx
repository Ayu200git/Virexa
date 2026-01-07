"use client";

import { useEffect, useState } from "react";
import { getLocalBookings } from "@/lib/mock-data";
import { VideoPlayer } from "./VideoPlayer";
import { Sparkles } from "lucide-react";

interface LockedVideoSectionProps {
    sessionId: string;
    videoUrl: string;
    isRealBooked: boolean;
}

export function LockedVideoSection({ sessionId, videoUrl, isRealBooked }: LockedVideoSectionProps) {
    const [isBooked, setIsBooked] = useState(isRealBooked);

    useEffect(() => {
        const checkBooking = () => {
            if (!isRealBooked && sessionId.startsWith("mock-")) {
                const localBookings = getLocalBookings();
                setIsBooked(localBookings.includes(sessionId));
            } else {
                setIsBooked(isRealBooked);
            }
        };

        checkBooking();

        window.addEventListener("virexa-booking-updated", checkBooking);
        return () => window.removeEventListener("virexa-booking-updated", checkBooking);
    }, [sessionId, isRealBooked]);

    // If not booked (and not a server-confirmed booking), we hide the entire section
    if (!isBooked) return null;

    return (
        <section id="video-section" className="space-y-6 rounded-3xl bg-muted/20 p-8 border border-primary/10 scroll-mt-24 backdrop-blur-sm min-h-[300px] transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            Recorded Session
                        </h2>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 animate-in fade-in zoom-in duration-500">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                            Now Unlocked
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Enjoy your exclusive workout access</p>
                </div>
            </div>
            <VideoPlayer videoUrl={videoUrl} />
        </section>
    );
}
