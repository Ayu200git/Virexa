"use client";

import { useState } from "react";
import { ClassesMapSidebar } from "./ClassesMapSidebar";
import type { UPCOMING_SESSIONS_QUERYResult } from "@/sanity.types";
import { Card } from "@/components/ui/card";
import { MapPin, Search, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SessionVenue = NonNullable<UPCOMING_SESSIONS_QUERYResult[number]["venue"]>;

interface MapClientProps {
    venues: SessionVenue[];
    userLocation: { lat: number; lng: number };
}

export function MapClient({ venues, userLocation }: MapClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [highlightedVenueId, setHighlightedVenueId] = useState<string | null>(null);

    const filteredVenues = venues.filter((venue) =>
        venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[500px] gap-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Studio Map</h1>
                    <p className="text-muted-foreground">
                        Find and book classes at studios near you.
                    </p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search studios or cities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
                {/* Sidebar */}
                <Card className="lg:col-span-1 overflow-hidden flex flex-col border-primary/10">
                    <div className="p-4 border-b bg-muted/30">
                        <h2 className="font-semibold flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            Nearby Studios
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredVenues.length > 0 ? (
                            // Group by ID to show unique venues in list
                            Array.from(new Map(filteredVenues.map(v => [v._id, v])).values()).map((venue) => (
                                <button
                                    key={venue._id}
                                    onClick={() => setHighlightedVenueId(venue._id)}
                                    className={`w-full text-left p-3 rounded-lg transition-colors hover:bg-muted ${highlightedVenueId === venue._id ? "bg-primary/10 ring-1 ring-primary/30" : ""
                                        }`}
                                >
                                    <p className="font-medium text-sm">{venue.name}</p>
                                    {venue.city && (
                                        <p className="text-xs text-muted-foreground">{venue.city}</p>
                                    )}
                                </button>
                            ))) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <p className="text-sm text-balance">No studios found matching your search.</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Map */}
                <Card className="lg:col-span-3 relative overflow-hidden border-primary/10">
                    <ClassesMapSidebar
                        venues={filteredVenues}
                        userLocation={userLocation}
                        highlightedVenueId={highlightedVenueId}
                        onVenueClick={setHighlightedVenueId}
                    />
                </Card>
            </div>
        </div>
    );
}
