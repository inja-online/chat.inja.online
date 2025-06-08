import { useDexie } from "~/providers/dexie-provider";
import { useToast } from "./use-toast";
import type { MessageRole, MessageStatus } from "~/db/dexie";

export function useChat() {
  const dexie = useDexie();
  const { success, error } = useToast();

  const createProject = async (name: string, context: string[] = []) => {
    try {
      const projectId = await dexie.addProject({
        name,
        context,
        status: "active",
      });
      success("Project created successfully");
      return projectId;
    } catch (err) {
      error("Failed to create project");
      throw err;
    }
  };

  const createThread = async (projectId: number, title = "New Chat") => {
    try {
      const threadId = await dexie.addThread({
        projectId,
        title,
        isTitleUserEdited: false,
        status: "active",
      });
      success("New chat started");
      return threadId;
    } catch (err) {
      error("Failed to create chat");
      throw err;
    }
  };

  const sendMessage = async (
    threadId: number,
    projectId: number,
    content: string,
    role: MessageRole = "user",
    model?: string,
    modelParams?: Record<string, any>
  ) => {
    try {
      const messageId = await dexie.addMessage({
        threadId,
        projectId,
        content,
        role,
        status: "completed",
        model,
        modelParams,
      });
      return messageId;
    } catch (err) {
      error("Failed to send message");
      throw err;
    }
  };

  const updateMessageStatus = async (
    messageId: number,
    status: MessageStatus
  ) => {
    try {
      await dexie.updateMessage(messageId, { status });
    } catch (err) {
      error("Failed to update message status");
      throw err;
    }
  };

  const getThreadMessages = async (threadId: number) => {
    return await dexie.getMessagesByThread(threadId);
  };

  const getProjectThreads = async (projectId: number) => {
    return await dexie.getThreadsByProject(projectId);
  };

  const searchInMessages = async (query: string) => {
    return await dexie.searchMessages(query);
  };

  const archiveThread = async (threadId: number) => {
    try {
      await dexie.updateThread(threadId, { status: "archived" });
      success("Chat archived");
    } catch (err) {
      error("Failed to archive chat");
      throw err;
    }
  };

  const deleteThread = async (threadId: number) => {
    try {
      await dexie.deleteThread(threadId);
      success("Chat deleted");
    } catch (err) {
      error("Failed to delete chat");
      throw err;
    }
  };

  return {
    projects: dexie.projects,
    threads: dexie.threads,
    messages: dexie.messages,
    createProject,
    createThread,
    sendMessage,
    updateMessageStatus,
    getThreadMessages,
    getProjectThreads,
    searchInMessages,
    archiveThread,
    deleteThread,
  };
}
