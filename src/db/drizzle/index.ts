import "server-only";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
  }
}

export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

const mockD1 = {} as D1Database;
export const db = drizzle(mockD1, { schema });

export type Database = ReturnType<typeof createDb>;
export { schema };
export * from "./schema";
