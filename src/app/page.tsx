import { getAuth } from "~/lib/auth";
import { getApiKeySession } from "~/lib/api-auth";
import { ChatApp } from "~/components/chat-app";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check for API key session first
  const apiKeySession = await getApiKeySession();
  if (apiKeySession) {
    return <ChatApp user={apiKeySession.user} />;
  }

  // Check for OAuth session
  const session = await getAuth();
  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  return <ChatApp user={session.user} />;
}
