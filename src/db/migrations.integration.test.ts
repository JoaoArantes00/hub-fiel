import { readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createTestDatabase,
  MIGRATIONS_FOLDER,
  type TestDatabase,
  type TestDb,
} from "./testing/test-database";

// Tabelas da Fase 1 (IMPLEMENTATION_PLAN §7), e só elas.
const PHASE_1_TABLES = [
  "clubs",
  "coach_team_tenures",
  "coaches",
  "competition_editions",
  "competition_participants",
  "competitions",
  "matches",
  "people",
  "player_positions",
  "player_team_memberships",
  "players",
  "positions",
  "team_seasons",
  "teams",
  "venues",
];

describe.skipIf(!process.env.DATABASE_URL)("migrations", () => {
  let testDb: TestDatabase | undefined;
  let db: TestDb;

  beforeAll(async () => {
    // createTestDatabase parte de um banco vazio e aplica as migrations.
    testDb = await createTestDatabase();
    db = testDb.db;
  }, 30_000);

  afterAll(async () => {
    await testDb?.drop();
  });

  it("um banco novo recebe exatamente as tabelas da Fase 1 e nenhuma de fases posteriores", async () => {
    const rows = await db.execute<{ table_name: string }>(sql`
      select table_name from information_schema.tables
      where table_schema = 'public' order by table_name
    `);

    expect([...rows].map((r) => r.table_name)).toEqual(PHASE_1_TABLES);
  });

  it("registra todas as migrations do journal e reaplicar é um no-op", async () => {
    const journal = JSON.parse(
      readFileSync(join(MIGRATIONS_FOLDER, "meta", "_journal.json"), "utf-8"),
    ) as { entries: unknown[] };

    await expect(
      migrate(db, { migrationsFolder: MIGRATIONS_FOLDER }),
    ).resolves.toBeUndefined();

    const applied = await db.execute<{ total: number }>(
      sql`select count(*)::int as total from drizzle.__drizzle_migrations`,
    );
    expect([...applied][0]?.total).toBe(journal.entries.length);
  });

  it("cria os 10 tipos enum do domínio", async () => {
    const rows = await db.execute<{ typname: string }>(sql`
      select typname from pg_type where typtype = 'e' order by typname
    `);

    expect([...rows].map((r) => r.typname)).toEqual([
      "competition_scope",
      "competition_status",
      "competition_type",
      "date_precision",
      "gender",
      "match_status",
      "membership_type",
      "position_group",
      "preferred_foot",
      "team_level",
    ]);
  });
});
