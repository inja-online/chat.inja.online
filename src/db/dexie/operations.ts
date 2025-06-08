import {
  db,
  type Project,
  type Thread,
  type Message,
  type SearchToken,
} from "./schema";

export async function addProject(
  projectData: Omit<Project, "id" | "createdAt" | "updatedAt">
): Promise<number | undefined> {
  const now = new Date();
  return await db.projects.add({
    ...projectData,
    createdAt: now,
    updatedAt: now,
  });
}

export async function addThread(
  threadData: Omit<Thread, "id" | "createdAt" | "updatedAt" | "lastMessageAt">
): Promise<number | undefined> {
  const now = new Date();
  return await db.threads.add({
    ...threadData,
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
  });
}

export async function addMessage(
  messageData: Omit<Message, "id" | "createdAt">
): Promise<number | undefined> {
  const now = new Date();
  const messageId = await db.messages.add({
    ...messageData,
    createdAt: now,
  });

  await Promise.all([
    db.threads.update(messageData.threadId, {
      lastMessageAt: now,
      lastMessageContent: messageData.content.substring(0, 100),
      updatedAt: now,
    }),
    db.projects.update(messageData.projectId, {
      updatedAt: now,
    }),
  ]);

  await indexMessageContent(messageId as number, messageData.content);

  return messageId as number;
}

export async function addSearchToken(
  tokenData: Omit<SearchToken, "id" | "createdAt">
): Promise<number | undefined> {
  const now = new Date();
  return await db.searchTokens.add({
    ...tokenData,
    createdAt: now,
  });
}

export async function updateProject(
  id: number,
  changes: Partial<Project>
): Promise<number> {
  return await db.projects.update(id, {
    ...changes,
    updatedAt: new Date(),
  });
}

export async function updateThread(
  id: number,
  changes: Partial<Thread>
): Promise<number> {
  return await db.threads.update(id, {
    ...changes,
    updatedAt: new Date(),
  });
}

export async function updateMessage(
  id: number,
  changes: Partial<Message>
): Promise<number> {
  const message = await db.messages.get(id);
  if (!message) return 0;

  const result = await db.messages.update(id, changes);

  if (changes.content) {
    await reindexMessageContent(id, changes.content);
  }

  return result;
}

export async function deleteProject(id: number): Promise<void> {
  await db.transaction(
    "rw",
    [db.projects, db.threads, db.messages, db.searchTokens],
    async () => {
      const threads = await db.threads.where("projectId").equals(id).toArray();
      const threadIds = threads
        .map((t) => t.id)
        .filter((id) => id !== undefined) as number[];

      const messages = await db.messages
        .where("projectId")
        .equals(id)
        .toArray();
      const messageIds = messages
        .map((m) => m.id)
        .filter((id) => id !== undefined) as number[];

      await Promise.all([
        db.searchTokens
          .where("referenceId")
          .anyOf([...threadIds, ...messageIds, id])
          .delete(),
        db.messages.where("projectId").equals(id).delete(),
        db.threads.where("projectId").equals(id).delete(),
        db.projects.delete(id),
      ]);
    }
  );
}

export async function deleteThread(id: number): Promise<void> {
  await db.transaction(
    "rw",
    [db.threads, db.messages, db.searchTokens],
    async () => {
      const messages = await db.messages.where("threadId").equals(id).toArray();
      const messageIds = messages
        .map((m) => m.id)
        .filter((id) => id !== undefined) as number[];

      await Promise.all([
        db.searchTokens
          .where("referenceId")
          .anyOf([...messageIds, id])
          .delete(),
        db.messages.where("threadId").equals(id).delete(),
        db.threads.delete(id),
      ]);
    }
  );
}

export async function deleteMessage(id: number): Promise<void> {
  await db.transaction("rw", [db.messages, db.searchTokens], async () => {
    await Promise.all([
      db.searchTokens
        .where("referenceId")
        .equals(id)
        .and((token) => token.type === "message")
        .delete(),
      db.messages.delete(id),
    ]);
  });
}

async function indexMessageContent(
  messageId: number,
  content: string
): Promise<void> {
  const tokens = tokenizeContent(content);
  if (tokens.length > 0) {
    await db.searchTokens.add({
      tokens,
      type: "message",
      referenceId: messageId,
      createdAt: new Date(),
    });
  }
}

async function reindexMessageContent(
  messageId: number,
  content: string
): Promise<void> {
  await db.searchTokens
    .where("referenceId")
    .equals(messageId)
    .and((token) => token.type === "message")
    .delete();

  await indexMessageContent(messageId, content);
}

function tokenizeContent(content: string): string[] {
  return content
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 2)
    .slice(0, 50);
}
