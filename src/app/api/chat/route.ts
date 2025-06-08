import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getApiKeySession } from "~/lib/api-auth";
import { getAuth } from "~/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Check for API key session first
    const apiKeySession = await getApiKeySession();

    if (apiKeySession) {
      // Use API key authentication
      const { provider, apiKey } = apiKeySession;

      let model: any;
      switch (provider) {
        case "openai":
          model = openai("gpt-3.5-turbo", { apiKey });
          break;
        case "anthropic":
          model = anthropic("claude-3-haiku-20240307", { apiKey });
          break;
        case "google":
          model = google("gemini-pro", { apiKey });
          break;
        default:
          return NextResponse.json(
            { error: "Unsupported provider" },
            { status: 400 }
          );
      }

      const result = await streamText({
        model,
        messages,
        maxTokens: 1000,
      });

      return result.toDataStreamResponse();
    }

    // Check for OAuth session
    const session = await getAuth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // For OAuth users, use a default model (you could configure this per user)
    // Note: You'd need to configure default API keys for OAuth users
    const defaultModel = openai("gpt-3.5-turbo");

    const result = await streamText({
      model: defaultModel,
      messages,
      maxTokens: 1000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
