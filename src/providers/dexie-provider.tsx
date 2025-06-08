"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { createContext, useContext, type ReactNode } from "react";
import {
  db,
  type Project,
  type Thread,
  type Message,
  type SearchToken,
} from "../db/dexie/schema";
import * as operations from "../db/dexie/operations";
import * as queries from "../db/dexie/queries";
import * as exportUtils from "../db/dexie/export";

interface DexieContextValue {
  projects: Project[] | undefined;
  threads: Thread[] | undefined;
  messages: Message[] | undefined;
  searchTokens: SearchToken[] | undefined;

  operations: typeof operations;
  queries: typeof queries;
  export: typeof exportUtils;
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

  const value: DexieContextValue = {
    projects,
    threads,
    messages,
    searchTokens,
    operations,
    queries,
    export: exportUtils,
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
