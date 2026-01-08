import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import { UsersList } from "./UsersList";

const USERS_QUERY = defineQuery(`
  *[_type == "userProfile" && (
    name match $search + "*" ||
    email match $search + "*"
  )] | order(_createdAt desc) {
    _id,
    name,
    email,
    image,
    "tier": tier,
    "createdAt": _createdAt
  }
`);

export default async function UsersPage({
    searchParams
}: {
    searchParams: Promise<{ search?: string }>
}) {
    const params = await searchParams;
    const search = params.search || "";

    const { data: users } = await sanityFetch({
        query: USERS_QUERY,
        params: { search },
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">
                        Manage your application users and subscriptions.
                    </p>
                </div>
            </div>

            <UsersList users={users} />
        </div>
    );
}
