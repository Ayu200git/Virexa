"use client";

import { LayoutDashboard, Bolt, Home, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const stats = [
  {
    label: "Activities",
    icon: Bolt,
    href: "/admin/activities",
    description: "Manage class types",
  },
  {
    label: "Venues",
    icon: Home,
    href: "/admin/venues",
    description: "Manage locations",
  },
  {
    label: "Bookings",
    icon: Calendar,
    href: "/admin/bookings",
    description: "View all bookings",
    comingSoon: true,
  },
  {
    label: "Users",
    icon: Users,
    href: "/admin/users",
    description: "Manage members",
    comingSoon: true,
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the FitPass administration panel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.comingSoon ? "#" : stat.href}
              className={stat.comingSoon ? "cursor-not-allowed opacity-60" : ""}
            >
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {stat.description}
                  </div>
                  {stat.comingSoon && (
                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Coming Soon
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
