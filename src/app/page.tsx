import { Navigation } from "~/components/navigation";
import { ChatInterface } from "~/components/chat-interface";

export default async function Home() {
  return (
    <>
      <Navigation />
      <main className="flex min-h-screen flex-col">
        <div className="flex-1">
          <ChatInterface />
        </div>
      </main>
    </>
  );
}
