import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createCohere } from "@ai-sdk/cohere";
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
        case "openai": {
          const openaiProvider = createOpenAI({ apiKey });
          model = openaiProvider("gpt-3.5-turbo");
          break;
        }
        case "anthropic": {
          const anthropicProvider = createAnthropic({ apiKey });
          model = anthropicProvider("claude-3-haiku-20240307");
          break;
        }
        case "google": {
          const googleProvider = createGoogleGenerativeAI({ apiKey });
          model = googleProvider("gemini-pro");
          break;
        }
        case "mistral": {
          const mistralProvider = createMistral({ apiKey });
          model = mistralProvider("mistral-small-latest");
          break;
        }
        case "cohere": {
          const cohereProvider = createCohere({ apiKey });
          model = cohereProvider("command");
          break;
        }
        case "openrouter": {
          const openrouterProvider = createOpenAI({
            apiKey,
            baseURL: "https://openrouter.ai/api/v1",
          });
          model = openrouterProvider("gpt-3.5-turbo");
          break;
        }
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

    // For OAuth users, you'd need to configure default API keys
    // This is just a placeholder - in production, you'd want to configure this properly
    const defaultProvider = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
    const defaultModel = defaultProvider("gpt-3.5-turbo");

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
