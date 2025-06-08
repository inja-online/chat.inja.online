import { getAuth } from "~/lib/auth";
import { ChatApp } from "~/components/chat-app";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getAuth();

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  return <ChatApp user={session.user} />;
}
