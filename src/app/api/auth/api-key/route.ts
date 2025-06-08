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

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your-32-character-secret-key-here";
const ALGORITHM = "aes-256-gcm";

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
}

async function validateApiKey(
  provider: string,
  apiKey: string
): Promise<boolean> {
  try {
    switch (provider) {
      case "openai": {
        const provider = createOpenAI({ apiKey });
        const model = provider("gpt-3.5-turbo");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      case "anthropic": {
        const provider = createAnthropic({ apiKey });
        const model = provider("claude-3-haiku-20240307");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      case "google": {
        const provider = createGoogleGenerativeAI({ apiKey });
        const model = provider("gemini-pro");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      case "mistral": {
        const provider = createMistral({ apiKey });
        const model = provider("mistral-small-latest");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      case "cohere": {
        const provider = createCohere({ apiKey });
        const model = provider("command");
        await generateText({
          model,
          prompt: "test",
          maxTokens: 1,
        });
        return true;
      }

      case "openrouter": {
        const provider = createOpenAI({
          apiKey,
          baseURL: "https://openrouter.ai/api/v1",
        });
        const model = provider("gpt-3.5-turbo");
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

    const encryptedApiKey = encrypt(apiKey);
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

    cookieStore.set("api-key", encryptedApiKey, {
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
