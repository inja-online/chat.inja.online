import { type AIProvider, getAIModel } from "@/ai";
import { streamText } from "ai";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      provider = "openai",
      model,
      maxTokens,
      temperature,
      system,
    } = await request.json();

    if (!prompt) {
      return new Response("Prompt is required", { status: 400 });
    }

    const aiModel = getAIModel({
      provider: provider as AIProvider,
      model: model || undefined,
      maxTokens,
      temperature,
    });

    const result = streamText({
      model: aiModel,
      prompt,
      system,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Stream API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
