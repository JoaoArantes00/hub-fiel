import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "../schema";

export const MIGRATIONS_FOLDER = fileURLToPath(
  new URL("../migrations", import.meta.url),
);

/**
 * Cria um banco novo e vazio (nome único), aplica todas as migrations e o
 * devolve pronto para uso. `drop()` remove o banco.
 *
 * Só usa a DATABASE_URL para se conectar ao servidor e rodar CREATE/DROP
 * DATABASE do banco descartável: nunca escreve no banco apontado por ela.
 * Aponte para um PostgreSQL local/descartável, não para produção.
 */
export async function createTestDatabase() {
  const baseUrl = process.env.DATABASE_URL;
  if (!baseUrl) {
    throw new Error("DATABASE_URL é necessária para os testes de integração");
  }

  const name = `hub_fiel_test_${randomBytes(6).toString("hex")}`;
  const options = { onnotice: () => {} };

  const admin = postgres(baseUrl, { ...options, max: 1 });
  try {
    await admin.unsafe(`CREATE DATABASE "${name}"`);
  } finally {
    await admin.end();
  }

  const url = new URL(baseUrl);
  url.pathname = `/${name}`;
  const client = postgres(url.toString(), { ...options, max: 4 });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });

  return {
    db,
    client,
    async drop() {
      await client.end();
      const cleanup = postgres(baseUrl, { ...options, max: 1 });
      try {
        await cleanup.unsafe(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
      } finally {
        await cleanup.end();
      }
    },
  };
}

export type TestDatabase = Awaited<ReturnType<typeof createTestDatabase>>;
export type TestDb = TestDatabase["db"];
