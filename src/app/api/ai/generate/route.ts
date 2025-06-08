import { type AIProvider, getAIModel } from "@/ai";
import { generateText } from "ai";
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

    const result = await generateText({
      model: aiModel,
      prompt,
      system,
    });

    return Response.json({
      text: result.text,
      finishReason: result.finishReason,
      usage: result.usage,
    });
  } catch (error) {
    console.error("Generate API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
