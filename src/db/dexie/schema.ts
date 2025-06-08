import Dexie, { type EntityTable } from "dexie";

export type ThreadStatus = "active" | "archived" | "deleted";
export type ProjectStatus = "active" | "archived" | "deleted";
export type MessageRole = "user" | "assistant" | "system";
export type MessageStatus = "pending" | "completed" | "error" | "deleted";
export type SearchTokenType = "message" | "thread" | "project";
export type AttachmentType = "image" | "file" | "audio" | "video";

export interface Attachment {
  id: string;
  type: AttachmentType;
  name: string;
  size: number;
  mimeType: string;
  data: Blob | ArrayBuffer;
  url?: string;
  metadata?: Record<string, any>;
}

export interface Project {
  id?: number;
  name: string;
  context: string[];
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Thread {
  id?: number;
  projectId: number;
  title: string;
  isTitleUserEdited: boolean;
  status: ThreadStatus;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
  lastMessageContent?: string;
}

export interface Message {
  id?: number;
  threadId: number;
  projectId: number;
  content: string;
  model?: string;
  modelParams?: Record<string, any>;
  modelProviderMeta?: Record<string, any>;
  role: MessageRole;
  status: MessageStatus;
  createdAt: Date;
  attachments?: Attachment[];
  tokensUsed?: number;
  cost?: number;
}

export interface SearchToken {
  id?: number;
  tokens: string[];
  type: SearchTokenType;
  referenceId: number;
  createdAt: Date;
}

export interface SyncQueue {
  id?: number;
  operation: "create" | "update" | "delete";
  table: string;
  data: any;
  timestamp: Date;
  synced: boolean;
}

const db = new Dexie("ChatInjaDB") as Dexie & {
  projects: EntityTable<Project, "id">;
  threads: EntityTable<Thread, "id">;
  messages: EntityTable<Message, "id">;
  searchTokens: EntityTable<SearchToken, "id">;
  syncQueue: EntityTable<SyncQueue, "id">;
};

db.version(1).stores({
  projects: "++id, name, status, createdAt, updatedAt",
  threads: "++id, projectId, title, status, createdAt, updatedAt, lastMessageAt",
  messages: "++id, threadId, projectId, role, status, createdAt, model",
  searchTokens: "++id, type, referenceId, createdAt",
  syncQueue: "++id, operation, table, timestamp, synced",
});

db.version(2).stores({
  projects: "++id, name, status, createdAt, updatedAt",
  threads: "++id, projectId, title, status, createdAt, updatedAt, lastMessageAt",
  messages: "++id, threadId, projectId, role, status, createdAt, model, tokensUsed, cost",
  searchTokens: "++id, type, referenceId, createdAt, *tokens",
  syncQueue: "++id, operation, table, timestamp, synced",
});

db.version(3).stores({
  projects: "++id, name, status, createdAt, updatedAt, [status+updatedAt]",
  threads:
    "++id, projectId, title, status, createdAt, updatedAt, lastMessageAt, [projectId+status], [projectId+lastMessageAt]",
  messages:
    "++id, threadId, projectId, role, status, createdAt, model, tokensUsed, cost, [threadId+createdAt], [projectId+createdAt]",
  searchTokens: "++id, type, referenceId, createdAt, *tokens, [type+referenceId]",
  syncQueue: "++id, operation, table, timestamp, synced, [synced+timestamp]",
});

export { db };
