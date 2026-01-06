import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return new Response(
        `0:${JSON.stringify("I'm sorry, but the Gemini API key is not configured. Please add a valid GEMINI_API_KEY to your .env.local file. IMPORTANT: You must RESTART your 'npm run dev' process to apply changes to .env.local.")}\n`,
        {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "X-Vercel-AI-Data-Stream": "v1"
          }
        }
      );
    }

    // Initialize inside handler to use current environment variable
    const genAI = new GoogleGenerativeAI(apiKey);

    const systemPrompt = `
You are a helpful fitness class booking assistant for Virexa.

You help users:
- Discover fitness classes (Yoga, HIIT, Strength, etc.)
- Learn about venues and locations
- Understand subscription tiers (Basic, Performance, Champion)
- Get personalized class recommendations

Current User ID: ${userId}

Be friendly, concise, and professional. If you don't know something, be honest.
`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt,
    });

    // Convert history to Gemini format (excluding the last message)
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || "" }],
    }));

    const lastMessage = messages[messages.length - 1]?.content || "";

    const chat = model.startChat({
      history,
    });

    const result = await chat.sendMessageStream(lastMessage);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              // Manual Data Stream Protocol formatting: 0:"text"\n
              const formattedChunk = `0:${JSON.stringify(text)}\n`;
              controller.enqueue(encoder.encode(formattedChunk));
            }
          }
        } catch (streamError: any) {
          console.error("Streaming error:", streamError);
          const errorMessage = streamError?.message || "Unknown streaming error";
          const errorOutput = `\n\n[Chat error: ${errorMessage}]`;
          controller.enqueue(encoder.encode(`0:${JSON.stringify(errorOutput)}\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    });
  } catch (error: any) {
    console.error("Gemini chat error:", error);

    const errorMessage = error?.message || "Unknown error";
    const errorResponse = `0:${JSON.stringify(`Error: ${errorMessage}. (Check if your API key is correct and you have restarted the dev server)`)}\n`;

    return new Response(errorResponse, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1"
      }
    });
  }
}
