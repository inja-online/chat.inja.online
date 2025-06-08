"use client";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Slider } from "~/components/ui/slider";
import { Badge } from "~/components/ui/badge";
import {
  Send,
  Paperclip,
  Brain,
  Search,
  Image,
  FileText,
  X,
  Loader2,
  Bot,
} from "lucide-react";
import {
  MODELS,
  getCapabilityIcon,
  getModelByValue,
  type ModelCapability,
} from "~/lib/models";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface Attachment {
  id: string;
  name: string;
  type: "image" | "text";
  content: string;
  preview?: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [reasoning, setReasoning] = useState([5]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentModel = getModelByValue(selectedModel);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const reader = new FileReader();

      if (file.type.startsWith("image/")) {
        reader.onload = (e) => {
          const newAttachment: Attachment = {
            id: Date.now() + Math.random().toString(),
            name: file.name,
            type: "image",
            content: e.target?.result as string,
            preview: e.target?.result as string,
          };
          setAttachments((prev) => [...prev, newAttachment]);
        };
        reader.readAsDataURL(file);
      } else if (file.type === "text/plain") {
        reader.onload = (e) => {
          const newAttachment: Attachment = {
            id: Date.now() + Math.random().toString(),
            name: file.name,
            type: "text",
            content: e.target?.result as string,
          };
          setAttachments((prev) => [...prev, newAttachment]);
        };
        reader.readAsText(file);
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          reasoning: reasoning[0],
          webSearch: webSearchEnabled,
          attachments: attachments,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I understand your message. This is a placeholder response until the API is fully implemented.",
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setAttachments([]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto flex h-[90vh] w-full max-w-4xl flex-col">
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/20 p-6">
                <Bot className="h-12 w-12 text-primary" />
              </div>
              <h1 className="mb-3 text-3xl font-light tracking-tight text-foreground">
                How can I help you today?
              </h1>
              <p className="max-w-md text-center text-muted-foreground">
                Ask me anything and I'll do my best to provide helpful, accurate
                answers.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>
                  <div
                    className={`mt-2 text-xs ${
                      message.role === "user"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-muted px-4 py-3">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-card p-4">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-12 w-72 rounded-xl border-0 bg-muted/50 shadow-sm transition-colors hover:bg-muted/80">
                <div className="flex items-center gap-3 px-1">
                  {currentModel && (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background shadow-sm">
                        <currentModel.icon className="h-4 w-4 text-foreground" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-foreground">
                          {currentModel.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {currentModel.provider.name}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </SelectTrigger>
              <SelectContent className="w-80 rounded-2xl border-0 p-2 shadow-xl">
                <div className="space-y-1">
                  {MODELS.map((model) => (
                    <SelectItem
                      key={model.value}
                      value={model.value}
                      className="rounded-xl border-0 p-0 focus:bg-muted/50"
                    >
                      <div className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/80 shadow-sm">
                          <model.icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {model.label}
                            </span>
                            <div className="rounded-full bg-muted px-2 py-0.5">
                              <span className="text-xs font-medium text-muted-foreground">
                                {model.provider.name}
                              </span>
                            </div>
                          </div>
                          <p className="line-clamp-1 mb-2 text-xs text-muted-foreground">
                            {model.description}
                          </p>
                          <div className="flex items-center gap-1">
                            {Object.entries(model.capabilities).map(
                              ([key, enabled]) => {
                                if (!enabled) return null;
                                const Icon = getCapabilityIcon(
                                  key as keyof ModelCapability
                                );
                                return (
                                  <div
                                    key={key}
                                    className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5"
                                  >
                                    <Icon className="h-3 w-3 text-primary" />
                                    <span className="text-xs font-medium text-primary">
                                      {key}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                            <div className="ml-auto rounded-full bg-accent px-2 py-0.5">
                              <span className="text-xs font-medium text-accent-foreground">
                                {model.contextWindow}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectContent>
            </Select>

            {currentModel?.capabilities.reasoning && (
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Reasoning:
                </span>
                <Slider
                  value={reasoning}
                  onValueChange={setReasoning}
                  max={10}
                  min={1}
                  step={1}
                  className="w-16"
                />
                <Badge
                  variant="outline"
                  className="min-w-[24px] justify-center"
                >
                  {reasoning[0]}
                </Badge>
              </div>
            )}

            {currentModel?.capabilities.web && (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Web Search
                </span>
                <Switch
                  checked={webSearchEnabled}
                  onCheckedChange={setWebSearchEnabled}
                />
              </div>
            )}
          </div>

          {attachments.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2"
                >
                  {attachment.type === "image" ? (
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-muted-foreground" />
                      {attachment.preview && (
                        <img
                          src={attachment.preview}
                          alt={attachment.name}
                          className="h-6 w-6 rounded object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="max-w-24 truncate text-xs text-foreground">
                    {attachment.name}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-muted"
                    onClick={() => removeAttachment(attachment.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything..."
                className="min-h-12 resize-none rounded-xl border-border pr-12 text-sm focus:border-ring focus:ring-ring"
                rows={1}
              />
              <div className="absolute bottom-2 right-2 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={
                (!input.trim() && attachments.length === 0) || isLoading
              }
              className="h-12 rounded-xl bg-primary px-4 hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
