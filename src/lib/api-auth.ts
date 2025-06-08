import "server-only";
import { cookies } from "next/headers";
import crypto from "node:crypto";

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your-32-character-secret-key-here";
const ALGORITHM = "aes-256-gcm";

function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const tag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function getApiKeySession() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("api-session")?.value;
    const provider = cookieStore.get("api-provider")?.value;
    const encryptedApiKey = cookieStore.get("api-key")?.value;

    if (!sessionId || !provider || !encryptedApiKey) {
      return null;
    }

    const apiKey = decrypt(encryptedApiKey);

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
