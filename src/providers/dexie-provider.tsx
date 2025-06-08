"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { createContext, useContext, type ReactNode } from "react";
import {
  db,
  type Project,
  type Thread,
  type Message,
  type SearchToken,
  type ThreadStatus,
  type ProjectStatus,
  type MessageRole,
  type MessageStatus,
} from "../db/dexie";

interface DexieContextValue {
  projects: Project[] | undefined;
  threads: Thread[] | undefined;
  messages: Message[] | undefined;
  searchTokens: SearchToken[] | undefined;

  addProject: (
    project: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => Promise<number | undefined>;
  addThread: (
    thread: Omit<Thread, "id" | "createdAt" | "updatedAt" | "lastMessageAt">
  ) => Promise<number | undefined>;
  addMessage: (
    message: Omit<Message, "id" | "createdAt">
  ) => Promise<number | undefined>;
  addSearchToken: (
    token: Omit<SearchToken, "id" | "createdAt">
  ) => Promise<number | undefined>;

  updateProject: (id: number, changes: Partial<Project>) => Promise<number>;
  updateThread: (id: number, changes: Partial<Thread>) => Promise<number>;
  updateMessage: (id: number, changes: Partial<Message>) => Promise<number>;

  deleteProject: (id: number) => Promise<void>;
  deleteThread: (id: number) => Promise<void>;
  deleteMessage: (id: number) => Promise<void>;

  getThreadsByProject: (projectId: number) => Promise<Thread[]>;
  getMessagesByThread: (threadId: number) => Promise<Message[]>;
  getMessagesByProject: (projectId: number) => Promise<Message[]>;
  searchMessages: (query: string) => Promise<Message[]>;
}

const DexieContext = createContext<DexieContextValue | null>(null);

interface DexieProviderProps {
  children: ReactNode;
}

export function DexieProvider({ children }: DexieProviderProps) {
  const projects = useLiveQuery(() =>
    db.projects.orderBy("updatedAt").reverse().toArray()
  );
  const threads = useLiveQuery(() =>
    db.threads.orderBy("lastMessageAt").reverse().toArray()
  );
  const messages = useLiveQuery(() =>
    db.messages.orderBy("createdAt").toArray()
  );
  const searchTokens = useLiveQuery(() => db.searchTokens.toArray());

  const addProject = async (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
  ) => {
    const now = new Date();
    return await db.projects.add({
      ...projectData,
      createdAt: now,
      updatedAt: now,
    });
  };

  const addThread = async (
    threadData: Omit<Thread, "id" | "createdAt" | "updatedAt" | "lastMessageAt">
  ) => {
    const now = new Date();
    return await db.threads.add({
      ...threadData,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
    });
  };

  const addMessage = async (messageData: Omit<Message, "id" | "createdAt">) => {
    const now = new Date();
    const messageId = await db.messages.add({
      ...messageData,
      createdAt: now,
    });

    await db.threads.update(messageData.threadId, {
      lastMessageAt: now,
      lastMessageContent: messageData.content.substring(0, 100),
      updatedAt: now,
    });

    await db.projects.update(messageData.projectId, {
      updatedAt: now,
    });

    const tokens = messageData.content
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 2);

    if (tokens.length > 0) {
      await db.searchTokens.add({
        tokens,
        type: "message",
        referenceId: messageId as number,
        createdAt: now,
      });
    }

    return messageId as number;
  };

  const addSearchToken = async (
    tokenData: Omit<SearchToken, "id" | "createdAt">
  ) => {
    const now = new Date();
    return await db.searchTokens.add({
      ...tokenData,
      createdAt: now,
    });
  };

  const updateProject = async (id: number, changes: Partial<Project>) => {
    return await db.projects.update(id, {
      ...changes,
      updatedAt: new Date(),
    });
  };

  const updateThread = async (id: number, changes: Partial<Thread>) => {
    return await db.threads.update(id, {
      ...changes,
      updatedAt: new Date(),
    });
  };

  const updateMessage = async (id: number, changes: Partial<Message>) => {
    const message = await db.messages.get(id);
    if (message) {
      const result = await db.messages.update(id, changes);

      if (changes.content) {
        await db.searchTokens
          .where("referenceId")
          .equals(id)
          .and((token) => token.type === "message")
          .delete();

        const tokens = changes.content
          .toLowerCase()
          .split(/\s+/)
          .filter((token) => token.length > 2);

        if (tokens.length > 0) {
          await db.searchTokens.add({
            tokens,
            type: "message",
            referenceId: id,
            createdAt: new Date(),
          });
        }
      }

      return result;
    }
    return 0;
  };

  const deleteProject = async (id: number) => {
    await db.transaction(
      "rw",
      [db.projects, db.threads, db.messages, db.searchTokens],
      async () => {
        const threads = await db.threads
          .where("projectId")
          .equals(id)
          .toArray();
        const threadIds = threads
          .map((t) => t.id)
          .filter((id) => id !== undefined) as number[];

        await db.searchTokens
          .where("referenceId")
          .anyOf(threadIds)
          .and((token) => token.type === "message")
          .delete();
        await db.messages.where("projectId").equals(id).delete();
        await db.threads.where("projectId").equals(id).delete();
        await db.searchTokens
          .where("referenceId")
          .equals(id)
          .and((token) => token.type === "project")
          .delete();
        await db.projects.delete(id);
      }
    );
  };

  const deleteThread = async (id: number) => {
    await db.transaction(
      "rw",
      [db.threads, db.messages, db.searchTokens],
      async () => {
        const messages = await db.messages
          .where("threadId")
          .equals(id)
          .toArray();
        const messageIds = messages
          .map((m) => m.id)
          .filter((id) => id !== undefined) as number[];

        await db.searchTokens
          .where("referenceId")
          .anyOf(messageIds)
          .and((token) => token.type === "message")
          .delete();
        await db.messages.where("threadId").equals(id).delete();
        await db.searchTokens
          .where("referenceId")
          .equals(id)
          .and((token) => token.type === "thread")
          .delete();
        await db.threads.delete(id);
      }
    );
  };

  const deleteMessage = async (id: number) => {
    await db.transaction("rw", [db.messages, db.searchTokens], async () => {
      await db.searchTokens
        .where("referenceId")
        .equals(id)
        .and((token) => token.type === "message")
        .delete();
      await db.messages.delete(id);
    });
  };

  const getThreadsByProject = async (projectId: number) => {
    return await db.threads
      .where("projectId")
      .equals(projectId)
      .reverse()
      .sortBy("lastMessageAt");
  };

  const getMessagesByThread = async (threadId: number) => {
    return await db.messages
      .where("threadId")
      .equals(threadId)
      .sortBy("createdAt");
  };

  const getMessagesByProject = async (projectId: number) => {
    return await db.messages
      .where("projectId")
      .equals(projectId)
      .sortBy("createdAt");
  };

  const searchMessages = async (query: string) => {
    const searchTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2);
    if (searchTerms.length === 0) return [];

    const matchingTokens = await db.searchTokens
      .where("type")
      .equals("message")
      .filter((token) =>
        searchTerms.some((term) => token.tokens.some((t) => t.includes(term)))
      )
      .toArray();

    const messageIds = matchingTokens.map((token) => token.referenceId);
    return await db.messages.where("id").anyOf(messageIds).toArray();
  };

  const value: DexieContextValue = {
    projects,
    threads,
    messages,
    searchTokens,
    addProject,
    addThread,
    addMessage,
    addSearchToken,
    updateProject,
    updateThread,
    updateMessage,
    deleteProject,
    deleteThread,
    deleteMessage,
    getThreadsByProject,
    getMessagesByThread,
    getMessagesByProject,
    searchMessages,
  };

  return (
    <DexieContext.Provider value={value}>{children}</DexieContext.Provider>
  );
}

export function useDexie() {
  const context = useContext(DexieContext);
  if (!context) {
    throw new Error("useDexie must be used within a DexieProvider");
  }
  return context;
}
