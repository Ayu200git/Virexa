import { auth } from "@clerk/nextjs/server";
<<<<<<< HEAD
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
=======
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { aiTools } from "@/lib/ai/tools";
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages } = await req.json();

<<<<<<< HEAD
    if (!Array.isArray(messages)) {
      return new Response(
        "Invalid request: messages array required",
        { status: 400 }
      );
    }

    // Convert useChat messages → text prompt
    const prompt = messages
      .map((m: any) => {
        if (typeof m.content === "string") return m.content;

        if (Array.isArray(m.parts)) {
          return m.parts
            .filter((p: any) => p.type === "text")
            .map((p: any) => p.text)
            .join("");
        }

        return "";
      })
      .join("\n");

    const systemPrompt = `
You are a helpful fitness class booking assistant.

You help users:
- Discover fitness classes
- Learn about venues and locations
- Understand subscription tiers
- Get class recommendations

Be friendly, concise, and helpful.

User ID: ${userId}
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // ✅ FREE
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Gemini chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500 }
=======
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid request: messages array required", { status: 400 });
    }

    // Normalize UIMessage -> ModelMessage
    // Handle both string content and parts array format
    const normalizedMessages = messages.map((m: any) => {
      let content: string;
      
      if (typeof m.content === "string") {
        content = m.content;
      } else if (m.parts && Array.isArray(m.parts)) {
        // Extract text from parts array
        content = m.parts
          .filter((p: any) => p.type === "text")
          .map((p: any) => p.text || "")
          .join("");
      } else {
        content = "";
      }

      return {
        role: m.role,
        content,
      };
    });

    // Add system context with user ID for tools that need it
    const systemMessage = `You are a helpful fitness class booking assistant for FitPass. You help users:
- Find and discover fitness classes (yoga, HIIT, pilates, cycling, etc.)
- Learn about available venues and their locations
- Understand subscription tiers and pricing
- Get personalized class recommendations based on their goals
- Find class schedules and availability

Be friendly, encouraging, and knowledgeable about fitness. When users ask about classes, use the available tools to search the database and provide accurate information.

If a user wants to book a class, guide them to the classes page with the specific class details.

Format your responses in a clear, readable way. Use bullet points for lists and keep responses concise but informative.

The user's Clerk ID is: ${userId}. Use this when calling tools that require user identification, such as getUserBookings.`;

    // Use streamText with the agent's model, tools, and instructions
    const result = await streamText({
      model: openai("gpt-4o-mini"),
      system: systemMessage,
      messages: normalizedMessages,
      tools: aiTools,
      maxSteps: 5,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to process chat request",
        message: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
>>>>>>> 953c20b6c9406fbd1e7ecb5183cd33da48410d09
    );
  }
}
