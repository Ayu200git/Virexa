import type { ToolCallPart } from "./types";

// Extract text content from message parts
import type { UIMessage } from "ai";

export function getMessageText(message: UIMessage): string {
  // First check for direct string content
  if (
    "content" in message &&
    typeof (message as any).content === "string" &&
    (message as any).content.length > 0
  ) {
    return (message as any).content;
  }

  // Check for parts array
  if (message.parts && Array.isArray(message.parts) && message.parts.length > 0) {
    const textParts = message.parts
      .filter((part) => {
        // Handle both "text" type and any part with a text property
        return part.type === "text" || (part as any).text;
      })
      .map((part) => {
        // Extract text from different possible formats
        if (part.type === "text") {
          return (part as { type: "text"; text: string }).text || "";
        }
        return (part as any).text || "";
      })
      .filter((text) => text && text.trim().length > 0);

    if (textParts.length > 0) {
      return textParts.join("\n");
    }
  }

  // Fallback: try to extract any text-like content
  const messageAny = message as any;
  if (messageAny.text && typeof messageAny.text === "string") {
    return messageAny.text;
  }

  return "";
}

// Check if message has tool calls (parts starting with "tool-")
// Note: AI SDK parts are intentionally loosely typed, so we extract what we need
export function getToolParts(message: UIMessage): ToolCallPart[] {
  if (!message.parts || message.parts.length === 0) {
    return [];
  }
  return message.parts
    .filter((part) => part.type.startsWith("tool-"))
    .map((part) => {
      // Extract known fields from the part object
      const p = part as Record<string, unknown>;

      // Handle nested toolInvocation (AI SDK 3.3+/4.0+)
      if (p.toolInvocation) {
        const toolInvocation = p.toolInvocation as Record<string, unknown>;
        return {
          type: "tool-call", // Normalize type
          toolName: toolInvocation.toolName as string,
          toolCallId: toolInvocation.toolCallId as string,
          state: toolInvocation.state as ToolCallPart["state"],
          input: toolInvocation.args as Record<string, unknown> | undefined,
          args: toolInvocation.args as Record<string, unknown> | undefined,
          output: toolInvocation.result as ToolCallPart["output"],
          result: toolInvocation.result as ToolCallPart["result"],
        };
      }

      // Handle flat structure (older versions or specific parts)
      return {
        type: p.type as string,
        toolName: p.toolName as string | undefined,
        toolCallId: p.toolCallId as string | undefined,
        state: p.state as ToolCallPart["state"],
        input: p.input as Record<string, unknown> | undefined,
        args: p.args as Record<string, unknown> | undefined,
        output: p.output as ToolCallPart["output"],
        result: p.result as ToolCallPart["result"],
      };
    });
}
