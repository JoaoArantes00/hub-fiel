import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../schema";
import { CLUB_SEED, CLUB_SLUG, POSITION_SEEDS, TEAM_SEEDS } from "./data";

export type SeedResult = {
  clubs: number;
  teams: number;
  positions: number;
};

/**
 * Popula os dados de referência iniciais. É idempotente: rodar de novo não
 * duplica nem sobrescreve nada (ON CONFLICT DO NOTHING nas chaves naturais),
 * então edições manuais feitas depois do primeiro seed são preservadas
 * (PROJECT_SPEC §12.6). Retorna quantas linhas foram realmente criadas.
 */
export async function seedInitialData(
  db: PostgresJsDatabase<typeof schema>,
): Promise<SeedResult> {
  return db.transaction(async (tx) => {
    const createdClubs = await tx
      .insert(schema.clubs)
      .values(CLUB_SEED)
      .onConflictDoNothing({ target: schema.clubs.slug })
      .returning({ id: schema.clubs.id });

    const club = await tx.query.clubs.findFirst({
      where: eq(schema.clubs.slug, CLUB_SLUG),
    });
    if (!club) {
      throw new Error(`Club "${CLUB_SLUG}" não encontrado após o seed`);
    }

    const createdTeams = await tx
      .insert(schema.teams)
      .values(TEAM_SEEDS.map((team) => ({ ...team, clubId: club.id })))
      .onConflictDoNothing({ target: schema.teams.slug })
      .returning({ id: schema.teams.id });

    const createdPositions = await tx
      .insert(schema.positions)
      .values(POSITION_SEEDS)
      .onConflictDoNothing({ target: schema.positions.code })
      .returning({ id: schema.positions.id });

    return {
      clubs: createdClubs.length,
      teams: createdTeams.length,
      positions: createdPositions.length,
    };
  });
}
