import { auth } from "@clerk/nextjs/server";
import { fitnessModel, fitnessInstructions, aiTools } from "@/lib/ai/agent";
import { streamText } from "ai";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request: messages array required", { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Gemini API key is not configured." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Standard streamText approach for Gemini in AI SDK beta
    const result = await streamText({
      model: fitnessModel,
      system: `${fitnessInstructions}\n\nCurrent User ID: ${userId}`,
      messages,
      tools: aiTools,
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
