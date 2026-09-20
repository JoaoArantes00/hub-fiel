import { asc, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as s from "../schema";
import {
  createTestDatabase,
  type TestDatabase,
  type TestDb,
} from "../testing/test-database";
import { seedInitialData } from "./seed";

describe.skipIf(!process.env.DATABASE_URL)("seed inicial", () => {
  let testDb: TestDatabase | undefined;
  let db: TestDb;

  beforeAll(async () => {
    // Banco novo, criado só pelas migrations (critério de aceite da Fase 1).
    testDb = await createTestDatabase();
    db = testDb.db;
  }, 30_000);

  afterAll(async () => {
    await testDb?.drop();
  });

  it("cria o club, os 3 teams e as 10 posições em um banco novo", async () => {
    const result = await seedInitialData(db);

    expect(result).toEqual({ clubs: 1, teams: 3, positions: 10 });

    const [club] = await db.select().from(s.clubs);
    expect(club?.fullName).toBe("Sport Club Corinthians Paulista");
    expect(club?.slug).toBe("corinthians");

    const teams = await db.select().from(s.teams).orderBy(asc(s.teams.name));
    expect(teams.map((t) => t.name)).toEqual([
      "Corinthians Feminino",
      "Corinthians Masculino",
      "Corinthians Sub-20",
    ]);
    // Todos pertencem ao mesmo Club, com IDs gerados pelo banco.
    expect(new Set(teams.map((t) => t.clubId))).toEqual(new Set([club?.id]));

    const sub20 = teams.find((t) => t.slug === "corinthians-sub-20");
    expect(sub20).toMatchObject({
      gender: "male",
      ageCategory: "U20",
      level: "youth",
    });
    const feminino = teams.find((t) => t.slug === "corinthians-feminino");
    expect(feminino).toMatchObject({ gender: "female", level: "professional" });
  });

  it("cria as posições padrão, na ordem pedida, com grupo definido", async () => {
    const positions = await db
      .select()
      .from(s.positions)
      .orderBy(asc(s.positions.sortOrder));

    expect(positions.map((p) => p.code)).toEqual([
      "GK",
      "CB",
      "LB",
      "RB",
      "DM",
      "CM",
      "AM",
      "LW",
      "RW",
      "ST",
    ]);
    expect(positions.find((p) => p.code === "GK")?.groupName).toBe(
      "goalkeeper",
    );
    expect(positions.find((p) => p.code === "ST")?.groupName).toBe("forward");
  });

  it("é idempotente: rodar de novo não cria nem duplica nada", async () => {
    const again = await seedInitialData(db);

    expect(again).toEqual({ clubs: 0, teams: 0, positions: 0 });
    expect(await db.$count(s.clubs)).toBe(1);
    expect(await db.$count(s.teams)).toBe(3);
    expect(await db.$count(s.positions)).toBe(10);
  });

  it("não sobrescreve edições feitas depois do primeiro seed (spec §12.6)", async () => {
    await db
      .update(s.clubs)
      .set({ city: "Cidade Corrigida à Mão" })
      .where(eq(s.clubs.slug, "corinthians"));

    await seedInitialData(db);

    const [club] = await db
      .select()
      .from(s.clubs)
      .where(eq(s.clubs.slug, "corinthians"));
    expect(club?.city).toBe("Cidade Corrigida à Mão");
  });
});
