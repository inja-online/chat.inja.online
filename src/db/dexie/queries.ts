import { db, type Thread, type Message } from "./schema";

export async function getThreadsByProject(
  projectId: number
): Promise<Thread[]> {
  return await db.threads
    .where("projectId")
    .equals(projectId)
    .reverse()
    .sortBy("lastMessageAt");
}

export async function getMessagesByThread(
  threadId: number
): Promise<Message[]> {
  return await db.messages
    .where("threadId")
    .equals(threadId)
    .sortBy("createdAt");
}

export async function getMessagesByProject(
  projectId: number
): Promise<Message[]> {
  return await db.messages
    .where("projectId")
    .equals(projectId)
    .sortBy("createdAt");
}

export async function searchMessages(query: string): Promise<Message[]> {
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

  const messageIds = [
    ...new Set(matchingTokens.map((token) => token.referenceId)),
  ];
  return await db.messages.where("id").anyOf(messageIds).toArray();
}

export async function getProjectStats(projectId: number) {
  const [threads, messages] = await Promise.all([
    db.threads.where("projectId").equals(projectId).count(),
    db.messages.where("projectId").equals(projectId).count(),
  ]);

  const totalTokens = await db.messages
    .where("projectId")
    .equals(projectId)
    .and((message) => message.tokensUsed !== undefined)
    .toArray()
    .then((messages) =>
      messages.reduce((total, msg) => total + (msg.tokensUsed || 0), 0)
    );

  const totalCost = await db.messages
    .where("projectId")
    .equals(projectId)
    .and((message) => message.cost !== undefined)
    .toArray()
    .then((messages) =>
      messages.reduce((total, msg) => total + (msg.cost || 0), 0)
    );

  return {
    threadsCount: threads,
    messagesCount: messages,
    totalTokens,
    totalCost,
  };
}

export async function getRecentThreads(limit = 10): Promise<Thread[]> {
  return await db.threads
    .orderBy("lastMessageAt")
    .reverse()
    .limit(limit)
    .toArray();
}

export async function getActiveProjects() {
  return await db.projects
    .where("status")
    .equals("active")
    .sortBy("updatedAt")
    .then((projects) => projects.reverse());
}
