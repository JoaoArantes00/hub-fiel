import * as schema from "../schema";
import type { TestDb } from "./test-database";

// Factories para os testes: cada uma cria uma linha válida com dados únicos
// (contador) e aceita overrides. Nenhum ID é fixo; todos vêm do banco.

let counter = 0;
export const nextId = () => ++counter;

/** Código de posição único de 3 letras (AAA, AAB, ...), válido para `positions.code`. */
function positionCode(n: number) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return [n % 26, Math.floor(n / 26) % 26, Math.floor(n / 676) % 26]
    .map((i) => letters[i])
    .join("");
}

function first<T>(rows: T[]): T {
  const row = rows[0];
  if (row === undefined) throw new Error("INSERT não retornou linha");
  return row;
}

export async function insertClub(
  db: TestDb,
  overrides: Partial<typeof schema.clubs.$inferInsert> = {},
) {
  const n = nextId();
  return first(
    await db
      .insert(schema.clubs)
      .values({ name: `Club ${n}`, slug: `club-${n}`, ...overrides })
      .returning(),
  );
}

export async function insertTeam(
  db: TestDb,
  clubId: string,
  overrides: Partial<typeof schema.teams.$inferInsert> = {},
) {
  const n = nextId();
  return first(
    await db
      .insert(schema.teams)
      .values({
        clubId,
        name: `Team ${n}`,
        slug: `team-${n}`,
        gender: "male",
        level: "professional",
        ...overrides,
      })
      .returning(),
  );
}

/** Cria um club e um team dentro dele (atalho para testes que só precisam de um time). */
export async function insertClubAndTeam(
  db: TestDb,
  teamOverrides: Partial<typeof schema.teams.$inferInsert> = {},
) {
  const club = await insertClub(db);
  const team = await insertTeam(db, club.id, teamOverrides);
  return { club, team };
}

export async function insertPerson(
  db: TestDb,
  overrides: Partial<typeof schema.people.$inferInsert> = {},
) {
  const n = nextId();
  return first(
    await db
      .insert(schema.people)
      .values({ fullName: `Person ${n}`, slug: `person-${n}`, ...overrides })
      .returning(),
  );
}

export async function insertPlayer(db: TestDb, personId: string) {
  return first(
    await db.insert(schema.players).values({ personId }).returning(),
  );
}

export async function insertCoach(db: TestDb, personId: string) {
  return first(
    await db.insert(schema.coaches).values({ personId }).returning(),
  );
}

export async function insertPosition(
  db: TestDb,
  overrides: Partial<typeof schema.positions.$inferInsert> = {},
) {
  const n = nextId();
  return first(
    await db
      .insert(schema.positions)
      .values({
        code: positionCode(n),
        name: `Position ${n}`,
        groupName: "midfielder",
        sortOrder: n,
        ...overrides,
      })
      .returning(),
  );
}

export async function insertCompetition(
  db: TestDb,
  overrides: Partial<typeof schema.competitions.$inferInsert> = {},
) {
  const n = nextId();
  return first(
    await db
      .insert(schema.competitions)
      .values({
        name: `Competition ${n}`,
        slug: `competition-${n}`,
        scope: "national",
        competitionType: "league",
        gender: "male",
        ...overrides,
      })
      .returning(),
  );
}

export async function insertEdition(
  db: TestDb,
  competitionId: string,
  overrides: Partial<typeof schema.competitionEditions.$inferInsert> = {},
) {
  const n = nextId();
  return first(
    await db
      .insert(schema.competitionEditions)
      .values({
        competitionId,
        seasonLabel: `${2000 + n}`,
        slug: `edition-${n}`,
        ...overrides,
      })
      .returning(),
  );
}

export async function insertTeamSeason(
  db: TestDb,
  teamId: string,
  year: number,
) {
  return first(
    await db.insert(schema.teamSeasons).values({ teamId, year }).returning(),
  );
}

export async function insertMatch(
  db: TestDb,
  values: Pick<
    typeof schema.matches.$inferInsert,
    "competitionEditionId" | "homeTeamId" | "awayTeamId"
  > &
    Partial<typeof schema.matches.$inferInsert>,
) {
  return first(await db.insert(schema.matches).values(values).returning());
}
