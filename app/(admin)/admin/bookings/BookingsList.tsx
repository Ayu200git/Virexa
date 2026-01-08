"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search, MoreHorizontal, Ban, Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { cancelBookingAdmin } from "@/lib/actions/admin";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useEffect, useState } from "react";

export interface Booking {
  _id: string;
  userName: string;
  userEmail: string;
  activityName: string;
  startTime: string;
  status: "confirmed" | "cancelled" | "attended";
}

interface BookingsListProps {
  bookings: Booking[];
}

export function BookingsList({ bookings }: BookingsListProps) {
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

  const handleCancel = async (id: string) => {
    if (confirm("Are you sure you want to CANCEL this booking? This cannot be undone.")) {
      await cancelBookingAdmin(id);
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
            placeholder="Search bookings by user or class..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking) => (
                <TableRow key={booking._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.userName || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{booking.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{booking.activityName}</TableCell>
                  <TableCell>
                    {new Date(booking.startTime).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={(booking.status === 'confirmed' || booking.status === 'attended') ? 'default' : 'destructive'}
                      className={booking.status === 'confirmed' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {booking.status?.toUpperCase()}
                    </Badge>
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
                        <DropdownMenuItem
                          disabled={booking.status === 'cancelled'}
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleCancel(booking._id)}
                        >
                          <Ban className="mr-2 h-4 w-4" /> Cancel Booking
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
