import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/config/env";
import * as schema from "./schema";

function createDb() {
  const client = postgres(getEnv().DATABASE_URL, {
    // Necessário para o pooler em modo transaction do Supabase (porta 6543),
    // que não suporta prepared statements. Inofensivo em Postgres direto.
    prepare: false,
    // O padrão (30s) faria o health check travar com o banco fora do ar.
    connect_timeout: 5,
  });
  return drizzle(client, { schema });
}

type Db = ReturnType<typeof createDb>;

// Reaproveita a instância entre recarregamentos do `next dev` para não abrir
// um novo pool de conexões a cada hot reload.
const globalForDb = globalThis as unknown as { __hubFielDb?: Db };

/** Instância única e lazy do Drizzle. Não conecta até a primeira query. */
export function getDb(): Db {
  globalForDb.__hubFielDb ??= createDb();
  return globalForDb.__hubFielDb;
}

/** Executa `SELECT 1`. Rejeita se o banco estiver inacessível. */
export async function pingDatabase(): Promise<void> {
  await getDb().execute(sql`select 1`);
}
