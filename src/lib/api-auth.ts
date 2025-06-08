import "server-only";
import { cookies } from "next/headers";

export async function getApiKeySession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("api-session")?.value;
    const provider = cookieStore.get("api-provider")?.value;
    const ApiKey = cookieStore.get("api-key")?.value;

    if (!sessionId || !provider || !ApiKey) {
      return null;
    }

    const apiKey = ApiKey;

    return {
      sessionId,
      provider,
      apiKey,
      user: {
        id: `api-${sessionId}`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
        email: `user@${provider}.local`,
        image: null,
      },
    };
  } catch (error) {
    console.error("Failed to get API key session:", error);
    return null;
  }
}

export async function clearApiKeySession() {
  const cookieStore = await cookies();
  cookieStore.delete("api-session");
  cookieStore.delete("api-provider");
  cookieStore.delete("api-key");
}
