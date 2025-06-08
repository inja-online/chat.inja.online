import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createCohere } from "@ai-sdk/cohere";

async function validateApiKey(
  provider: string,
  apiKey: string
): Promise<boolean> {
  try {
    switch (provider) {
      case "openai": {
        const openai = createOpenAI({ apiKey });
        const model = openai("gpt-3.5-turbo");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      case "anthropic": {
        const anthropic = createAnthropic({ apiKey });
        const model = anthropic("claude-3-haiku-20240307");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      case "google": {
        const google = createGoogleGenerativeAI({ apiKey });
        const model = google("gemini-1.5-flash");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      case "mistral": {
        const mistral = createMistral({ apiKey });
        const model = mistral("mistral-small-latest");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      case "cohere": {
        const cohere = createCohere({ apiKey });
        const model = cohere("command");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      case "openrouter": {
        const openrouter = createOpenAI({
          apiKey,
          baseURL: "https://openrouter.ai/api/v1",
        });
        const model = openrouter("gpt-3.5-turbo");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      default:
        return false;
    }
  } catch (error) {
    console.error(`API key validation failed for ${provider}:`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { apiKey: string; provider: string };
    const { apiKey, provider } = body;

    if (!apiKey || !provider) {
      return NextResponse.json(
        { message: "API key and provider are required" },
        { status: 400 }
      );
    }

    const isValid = await validateApiKey(provider, apiKey);

    if (!isValid) {
      return NextResponse.json(
        { message: "Invalid API key or provider" },
        { status: 401 }
      );
    }

    const sessionId = crypto.randomUUID();

    const cookieStore = await cookies();
    cookieStore.set("api-session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set("api-provider", provider, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set("api-key", apiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API key authentication error:", error);
    return NextResponse.json(
      { message: "Authentication failed" },
      { status: 500 }
    );
  }
}
