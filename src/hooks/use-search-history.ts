import { db } from "~/db/dexie/schema";

export const useSearchHistory = () => {
  const addToHistory = async (
    query: string,
    metadata?: {
      threadId?: number;
      projectId?: number;
      resultCount?: number;
    }
  ) => {
    if (!query.trim()) return;

    try {
      const existingEntry = await db.searchHistory.where("query").equals(query.trim()).first();

      if (existingEntry) {
        if (existingEntry.id) {
          await db.searchHistory.update(existingEntry.id, {
            timestamp: new Date(),
            ...metadata,
          });
        }
      } else {
        await db.searchHistory.add({
          query: query.trim(),
          timestamp: new Date(),
          ...metadata,
        });
      }
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  };

  const getHistory = async (limit = 50) => {
    try {
      return await db.searchHistory.orderBy("timestamp").reverse().limit(limit).toArray();
    } catch (error) {
      console.error("Failed to load search history:", error);
      return [];
    }
  };

  const clearHistory = async () => {
    try {
      await db.searchHistory.clear();
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  const removeFromHistory = async (id: number) => {
    try {
      await db.searchHistory.delete(id);
    } catch (error) {
      console.error("Failed to remove from search history:", error);
    }
  };

  return {
    addToHistory,
    getHistory,
    clearHistory,
    removeFromHistory,
  };
};
