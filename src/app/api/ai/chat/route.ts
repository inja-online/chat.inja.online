import { type AIProvider, getAIModel } from "@/ai";
import { streamText } from "ai";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { messages, provider = "openai", model, maxTokens, temperature } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    const aiModel = getAIModel({
      provider: provider as AIProvider,
      model: model || undefined,
      maxTokens,
      temperature,
    });

    const result = streamText({
      model: aiModel,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
