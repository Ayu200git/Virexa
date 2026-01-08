import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { LayoutDashboard, Bolt, Home, Users, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATS_QUERY = defineQuery(`{
  "activitiesCount": count(*[_type == "activity"]),
  "venuesCount": count(*[_type == "venue"]),
  "bookingsCount": count(*[_type == "booking"]),
  "usersCount": count(*[_type == "userProfile"])
}`);

export default async function AdminDashboard() {
  const { data: stats } = await sanityFetch({ query: STATS_QUERY });

  const dashboardItems = [
    {
      label: "Activities",
      count: stats?.activitiesCount || 0,
      icon: Bolt,
      href: "/admin/activities",
      description: "Manage class types",
    },
    {
      label: "Venues",
      count: stats?.venuesCount || 0,
      icon: Home,
      href: "/admin/venues",
      description: "Manage locations",
    },
    {
      label: "Bookings",
      count: stats?.bookingsCount || 0,
      icon: Calendar,
      href: "/admin/bookings",
      description: "Manage class bookings",
    },
    {
      label: "Users",
      count: stats?.usersCount || 0,
      icon: Users,
      href: "/admin/users",
      description: "Manage members",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Virexa administration panel.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
            >
              <Card className="transition-all hover:bg-muted/50 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {item.label}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{item.count}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
