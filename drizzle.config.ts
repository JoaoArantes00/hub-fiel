import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";
import { getEnv } from "./src/config/env";

// O drizzle-kit roda fora do Next: carrega .env.local/.env do mesmo jeito que o
// Next faz, e reaproveita a validação de env do app.
loadEnvConfig(process.cwd());

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema",
  out: "./src/db/migrations",
  dbCredentials: {
    url: getEnv().DATABASE_URL,
  },
});
