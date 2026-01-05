import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages } = await req.json();

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
    );
  }
}
