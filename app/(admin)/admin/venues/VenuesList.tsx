"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, Plus, Pencil, Trash2, Loader2, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteVenue } from "@/lib/actions/admin";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEffect, useState } from "react";
import Link from "next/link";
import { CreateVenueDialog } from "./CreateVenueDialog";
import { Badge } from "@/components/ui/badge";

export interface Venue {
    _id: string;
    name: string;
    city: string;
    fullAddress: string;
    sessionCount: number;
}

interface VenuesListProps {
    venues: Venue[];
}

export function VenuesList({ venues }: VenuesListProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get("search") || "";
    const [search, setSearch] = useState(initialSearch);
    const debouncedSearch = useDebounce(search, 300);
    const [isPending, startTransition] = useTransition();

    // Sync search with URL
    useEffect(() => {
        if (debouncedSearch !== initialSearch) {
            const params = new URLSearchParams(searchParams);
            if (debouncedSearch) {
                params.set("search", debouncedSearch);
            } else {
                params.delete("search");
            }
            startTransition(() => {
                router.push(`?${params.toString()}`);
            });
        }
    }, [debouncedSearch, router, searchParams, initialSearch]);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this venue?")) {
            await deleteVenue(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search venues..."
                        className="pl-10"
                    />
                </div>
                <CreateVenueDialog />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Venue Name</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {venues.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            venues.map((venue) => (
                                <TableRow key={venue._id}>
                                    <TableCell className="font-medium">{venue.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{venue.city || "Unknown"}</Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={venue.fullAddress}>
                                        {venue.fullAddress}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/studio/structure/venue;${venue._id}`} target="_blank">
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit in Studio
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => handleDelete(venue._id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
