import { sql } from "drizzle-orm";
import { timestamp, uuid, type AnyPgColumn } from "drizzle-orm/pg-core";

/** PK UUID gerada pelo banco (gen_random_uuid). Nenhum ID é definido no código. */
export const primaryId = () => uuid("id").primaryKey().defaultRandom();

/**
 * created_at / updated_at em timestamptz. O `updated_at` é mantido por um
 * trigger no banco (migration `updated_at_triggers`), então vale para qualquer
 * caminho de escrita, inclusive `INSERT ... ON CONFLICT DO UPDATE` dos imports.
 */
export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Slug estável para URL: minúsculas, dígitos e hífens simples. */
export const isSlug = (column: AnyPgColumn) =>
  sql`${column} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`;

/** Código de país ISO 3166-1 alpha-2 em maiúsculas. NULL (desconhecido) passa. */
export const isCountryCode = (column: AnyPgColumn) =>
  sql`${column} ~ '^[A-Z]{2}$'`;
