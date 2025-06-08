import { redirect } from "next/navigation";
import { ChatApp } from "~/components/chat-app";
import { Navigation } from "~/components/navigation";
import { getAuth } from "~/lib/auth";

export default async function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen" />
    </>
  );
}
