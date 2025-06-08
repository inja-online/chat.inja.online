"use client";

import { useChat } from "ai/react";
import { LogOut, MessageSquare, Plus, Send, Settings, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ChatAppProps {
  user: User;
}

export function ChatApp({ user }: ChatAppProps) {
  const handleSignOut = async () => {
    try {
      // Try to clear API key session first
      const response = await fetch("/api/auth/signout", { method: "POST" });
      if (response.ok) {
        window.location.href = "/auth/signin";
        return;
      }
    } catch (error) {
      console.log("No API key session to clear");
    }

    // Fall back to OAuth sign out
    signOut();
  };
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string>("");

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    onError: (error) => {
      console.error("Chat error:", error);
      alert("Failed to send message. Please try again.");
    },
    onFinish: (message) => {
      updateChatWithMessages(messages.concat(message));
    },
  });

  const currentChat = chats.find((chat) => chat.id === activeChat);

  const updateChatWithMessages = (newMessages: any[]) => {
    if (!activeChat) return;

    const convertedMessages: Message[] = newMessages.map((msg) => ({
      id: msg.id || Date.now().toString(),
      content: msg.content,
      timestamp: new Date(msg.createdAt || Date.now()),
      isUser: msg.role === "user",
    }));

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChat
          ? {
              ...chat,
              messages: convertedMessages,
              title:
                convertedMessages.length > 0 && chat.title === "New Chat"
                  ? `${convertedMessages[0].content.slice(0, 30)}...`
                  : chat.title,
              updatedAt: new Date(),
            }
          : chat
      )
    );
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      updatedAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessages([]);
  };

  const switchToChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setActiveChat(chatId);
      const convertedMessages = chat.messages.map((msg) => ({
        id: msg.id,
        role: msg.isUser ? "user" : "assistant",
        content: msg.content,
        createdAt: msg.timestamp.toISOString(),
      }));
      setMessages(convertedMessages);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChat) {
      createNewChat();
    }
    handleSubmit(e);
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="flex w-80 flex-col border-border border-r">
        <div className="border-border border-b p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="font-semibold text-xl">Chats</h1>
            <Button onClick={createNewChat} size="sm" className="h-8 w-8" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback>
                  {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-sm">{user.name || user.email}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-2 p-2">
            {chats.map((chat) => (
              <Card
                key={chat.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                  activeChat === chat.id ? "bg-muted" : ""
                }`}
                onClick={() => switchToChat(chat.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{chat.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {chat.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex flex-1 flex-col">
        {currentChat ? (
          <>
            <div className="border-border border-b p-4">
              <h2 className="font-semibold text-lg">{currentChat.title}</h2>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="mt-1 text-xs opacity-70">
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-border border-t p-4">
              <form onSubmit={handleFormSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 font-semibold text-lg">No chat selected</h3>
              <p className="text-muted-foreground">
                Select a chat from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
