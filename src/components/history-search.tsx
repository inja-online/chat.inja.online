"use client";

import {
  ArrowRight,
  Clock,
  Hash,
  MessageSquare,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { useBindToKey } from "~/hooks/use-bind-to-key";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  db,
} from "~/db/dexie/schema";

interface HistorySearchProps {
  onSelectHistory?: (query: string) => void;
  onSelectThread?: (threadId: number) => void;
  onSelectMessage?: (messageId: number, threadId: number) => void;
  currentProjectId?: number;
}

interface SearchResult {
  type: "query" | "thread" | "message";
  id: number;
  title: string;
  content?: string;
  timestamp: Date;
  threadId?: number;
  metadata?: string;
}

export function HistorySearch({
  onSelectHistory,
  onSelectThread,
  onSelectMessage,
  currentProjectId,
}: HistorySearchProps) {
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useBindToKey(
    [
      ["cmd", "k"],
      ["ctrl", "h"],
    ],
    () => {
      setOpen(true);
    }
  );

  const search = useCallback(
    async (searchQuery: string) => {
      setLoading(true);
      try {
        if (!searchQuery.trim()) {
          const [threads, history] = await Promise.all([
            db.threads
              .where("status")
              .equals("active")
              .and(
                (thread) =>
                  !currentProjectId || thread.projectId === currentProjectId
              )
              .reverse()
              .sortBy("lastMessageAt"),
            db.searchHistory.orderBy("timestamp").reverse().limit(5).toArray(),
          ]);

          const threadResults: SearchResult[] = threads
            .slice(0, 15)
            .map((thread) => ({
              type: "thread",
              id: thread.id ?? 0,
              title: thread.title,
              content: thread.lastMessageContent,
              timestamp: thread.lastMessageAt || thread.updatedAt,
              threadId: thread.id,
            }));

          const historyResults: SearchResult[] = history.map((h) => ({
            type: "query",
            id: h.id ?? 0,
            title: h.query,
            timestamp: h.timestamp,
            threadId: h.threadId,
            metadata: h.resultCount ? `${h.resultCount} results` : undefined,
          }));

          setResults([...threadResults, ...historyResults]);
          return;
        }

        const terms = searchQuery.toLowerCase().split(" ").filter(Boolean);
        const allResults: SearchResult[] = [];

        const [threads, messages, history] = await Promise.all([
          db.threads.where("status").equals("active").toArray(),
          db.messages.limit(100).toArray(),
          db.searchHistory.limit(20).toArray(),
        ]);

        for (const item of [...threads, ...messages, ...history]) {
          const text =
            "title" in item
              ? item.title
              : "content" in item
              ? item.content
              : "query" in item
              ? item.query
              : "";
          const score = terms.reduce(
            (acc, term) => acc + (text.toLowerCase().includes(term) ? 1 : 0),
            0
          );

          if (score > 0) {
            if ("title" in item) {
              allResults.push({
                type: "thread",
                id: item.id ?? 0,
                title: item.title,
                content: item.lastMessageContent,
                timestamp: item.lastMessageAt || item.updatedAt,
                threadId: item.id,
              });
            } else if ("content" in item) {
              const thread = threads.find((t) => t.id === item.threadId);
              allResults.push({
                type: "message",
                id: item.id ?? 0,
                title: `${item.content.substring(0, 80)}...`,
                timestamp: item.createdAt,
                threadId: item.threadId,
                metadata: thread?.title,
              });
            } else if ("query" in item) {
              allResults.push({
                type: "query",
                id: item.id ?? 0,
                title: item.query,
                timestamp: item.timestamp,
                threadId: item.threadId,
              });
            }
          }
        }

        setResults(
          allResults
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 30)
        );
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [currentProjectId]
  );

  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => search(query), 150);
      return () => clearTimeout(timeoutId);
    }
  }, [query, search, open]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery("");

    if (result.type === "thread") {
      onSelectThread?.(result.threadId ?? 0);
    } else if (result.type === "message") {
      onSelectMessage?.(result.id, result.threadId ?? 0);
    } else {
      onSelectHistory?.(result.title);
    }
  };

  const clearHistory = async () => {
    await db.searchHistory.clear();
    search(query);
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return "now";
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "thread":
        return <MessageSquare className="h-5 w-5" />;
      case "message":
        return <User className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const renderItem = (result: SearchResult) => (
    <CommandItem
      key={`${result.type}-${result.id}`}
      value={result.title}
      onSelect={() => handleSelect(result)}
      className="flex items-start gap-3 px-6 py-4"
    >
      <div className="mt-1 text-muted-foreground">{getIcon(result.type)}</div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 truncate font-medium text-sm">{result.title}</div>
        {result.content && (
          <div className="mb-2 line-clamp-2 text-muted-foreground text-xs">
            {result.content}
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <span>{formatTime(result.timestamp)}</span>
          {result.metadata && <span>• {result.metadata}</span>}
        </div>
      </div>
      <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground" />
    </CommandItem>
  );

  const grouped = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
        title="Search Chats (⌘K)"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} className="max-w-5xl">
        <CommandInput
          placeholder={query ? "Search..." : "Search or browse your chats..."}
          value={query}
          onValueChange={setQuery}
          className="text-lg"
        />
        <CommandList className="max-h-[80vh]">
          <CommandEmpty>
            <div className="py-16 text-center">
              <Clock className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-muted-foreground text-xl">
                {loading
                  ? "Searching..."
                  : query
                  ? "No results found"
                  : "Start typing to search"}
              </p>
            </div>
          </CommandEmpty>

          {!query && grouped.thread && (
            <CommandGroup heading="Recent Chats">
              {grouped.thread.slice(0, 12).map(renderItem)}
            </CommandGroup>
          )}

          {!query && grouped.query && (
            <CommandGroup heading="Recent Searches">
              {grouped.query.map(renderItem)}
            </CommandGroup>
          )}

          {query && grouped.thread && (
            <CommandGroup heading="Threads">
              {grouped.thread.slice(0, 8).map(renderItem)}
            </CommandGroup>
          )}

          {query && grouped.message && (
            <CommandGroup heading="Messages">
              {grouped.message.slice(0, 6).map(renderItem)}
            </CommandGroup>
          )}

          {query && grouped.query && (
            <CommandGroup heading="Search History">
              {grouped.query.slice(0, 4).map(renderItem)}
            </CommandGroup>
          )}

          {grouped.query && (
            <CommandGroup>
              <CommandItem
                onSelect={clearHistory}
                className="justify-center px-6 py-3 text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear search history
              </CommandItem>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
