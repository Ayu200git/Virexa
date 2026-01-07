import { createAgentUIStreamResponse } from "ai";
import { fitnessAgent } from "@/lib/ai/agent";
import { auth } from "@clerk/nextjs/server";
import { getUserTier } from "@/lib/subscription-server";
import { getUserPreferences } from "@/lib/actions/profile";

export async function POST(request: Request) {
  try {
    console.log("[Chat API] Request received");
    const { userId: clerkId } = await auth();
    console.log("[Chat API] Clerk ID:", clerkId);

    // Reject unauthenticated requests
    if (!clerkId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    console.log("[Chat API] Request body:", JSON.stringify(body).substring(0, 200));
    const { messages } = body;
    console.log("[Chat API] Messages count:", messages?.length);

    // Validate messages parameter
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("[Chat API] Invalid messages:", messages);
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch user context in parallel
    const [tier, preferences] = await Promise.all([
      getUserTier(clerkId),
      getUserPreferences(),
    ]);

    // Build rich user context for the AI
    const locationContext = preferences?.location
      ? `- Location: ${preferences.location.address}
- Search radius: ${preferences.searchRadius} km
- Coordinates: ${preferences.location.lat}, ${preferences.location.lng}`
      : "- Location: Not set";

    const tierContext = tier
      ? `- Subscription: ${tier} tier`
      : "- Subscription: No active subscription";

    // Get current date/time for accurate "today" / "tomorrow" handling
    const now = new Date();
    const dateTimeContext = `- Current date: ${now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
- Current time: ${now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })}
- Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`;

    // Inject user context as a system message
    const enhancedMessages = [
      {
        id: "system-context",
        role: "system" as const,
        parts: [
          {
            type: "text" as const,
            text: `Current date and time:
${dateTimeContext}

Current user context:
- Clerk ID: ${clerkId}
${tierContext}
${locationContext}

Guidelines:
- Use the current date/time above to accurately determine "today", "tomorrow", etc. when discussing sessions.
- When searching for classes or venues, consider the user's location and radius.
- When the user asks about their bookings, use the getUserBookings tool with their clerkId (${clerkId}).
- Personalize recommendations based on their subscription tier (${tier || "none"
              }).
- If user has no subscription, encourage them to check out the subscription plans.
- Keep responses concise and helpful.`,
          },
        ],
      },
      ...messages,
    ];

    console.log("[Chat API] Creating agent response");
    return createAgentUIStreamResponse({
      agent: fitnessAgent as any, // Type assertion needed for ToolLoopAgent compatibility
      uiMessages: enhancedMessages,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
