import { defineConfig } from "drizzle-kit";
import { env } from "./src/env";

export default defineConfig({
  schema: "./src/db/drizzle/schema.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  ...(env.NODE_ENV === "development"
    ? {
        driver: "better-sqlite",
        dbCredentials: {
          url: "./local.db",
        },
      }
    : {
        driver: "d1-http",
        dbCredentials: {
          accountId: env.CLOUDFLARE_ACCOUNT_ID,
          databaseId: env.CLOUDFLARE_DATABASE_ID,
          token: env.CLOUDFLARE_API_TOKEN,
        },
      }),
});
