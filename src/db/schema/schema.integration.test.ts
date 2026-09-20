import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";
import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  insertClub,
  insertClubAndTeam,
  insertCoach,
  insertCompetition,
  insertEdition,
  insertMatch,
  insertPerson,
  insertPlayer,
  insertPosition,
  insertTeam,
  insertTeamSeason,
} from "../testing/factories";
import {
  createTestDatabase,
  type TestDatabase,
  type TestDb,
} from "../testing/test-database";
import {
  CHECK_VIOLATION,
  DELETE_RESTRICT_VIOLATION,
  expectViolation,
  FOREIGN_KEY_VIOLATION,
  INVALID_ENUM_VALUE,
  UNIQUE_VIOLATION,
} from "../testing/violations";
import * as s from "./index";

// Cada teste cria os próprios dados (slugs únicos), então compartilham um banco
// novo criado só pelas migrations. Roda apenas com um PostgreSQL disponível.
describe.skipIf(!process.env.DATABASE_URL)("schema de domínio", () => {
  let testDb: TestDatabase | undefined;
  let db: TestDb;

  beforeAll(async () => {
    testDb = await createTestDatabase();
    db = testDb.db;
  }, 30_000);

  afterAll(async () => {
    await testDb?.drop();
  });

  describe("Club e Team", () => {
    it("um Club pode possuir vários Teams", async () => {
      const club = await insertClub(db);
      const masculino = await insertTeam(db, club.id, { gender: "male" });
      const feminino = await insertTeam(db, club.id, { gender: "female" });
      const sub20 = await insertTeam(db, club.id, {
        ageCategory: "U20",
        level: "youth",
      });

      const rows = await db
        .select({ id: s.teams.id })
        .from(s.teams)
        .where(eq(s.teams.clubId, club.id));

      expect(rows.map((r) => r.id).sort()).toEqual(
        [masculino.id, feminino.id, sub20.id].sort(),
      );
    });

    it("um Team exige um Club existente", async () => {
      await expectViolation(insertTeam(db, randomUUID()), {
        code: FOREIGN_KEY_VIOLATION,
        constraint: "teams_club_id_clubs_id_fk",
      });
    });

    it("não apaga um Club que ainda tem Teams (ON DELETE RESTRICT)", async () => {
      const { club } = await insertClubAndTeam(db);

      await expectViolation(db.delete(s.clubs).where(eq(s.clubs.id, club.id)), {
        code: DELETE_RESTRICT_VIOLATION,
        constraint: "teams_club_id_clubs_id_fk",
      });
    });
  });

  describe("Person, Player e Coach", () => {
    it("uma Person pode ser Player e Coach", async () => {
      const person = await insertPerson(db);
      const player = await insertPlayer(db, person.id);
      const coach = await insertCoach(db, person.id);

      const [row] = await db
        .select({ playerId: s.players.id, coachId: s.coaches.id })
        .from(s.people)
        .innerJoin(s.players, eq(s.players.personId, s.people.id))
        .innerJoin(s.coaches, eq(s.coaches.personId, s.people.id))
        .where(eq(s.people.id, person.id));

      expect(row).toEqual({ playerId: player.id, coachId: coach.id });
    });

    it("uma Person tem no máximo um Player e um Coach", async () => {
      const person = await insertPerson(db);
      await insertPlayer(db, person.id);
      await insertCoach(db, person.id);

      await expectViolation(insertPlayer(db, person.id), {
        code: UNIQUE_VIOLATION,
        constraint: "players_person_id_unique",
      });
      await expectViolation(insertCoach(db, person.id), {
        code: UNIQUE_VIOLATION,
        constraint: "coaches_person_id_unique",
      });
    });

    it("rejeita óbito anterior ao nascimento", async () => {
      await expectViolation(
        insertPerson(db, { birthDate: "1990-05-01", deathDate: "1980-01-01" }),
        {
          code: CHECK_VIOLATION,
          constraint: "people_death_after_birth_ck",
        },
      );
    });
  });

  describe("passagens (memberships e tenures)", () => {
    it("um Player pode ter múltiplas passagens pelo mesmo Team", async () => {
      const { team } = await insertClubAndTeam(db);
      const player = await insertPlayer(db, (await insertPerson(db)).id);

      await db.insert(s.playerTeamMemberships).values([
        {
          playerId: player.id,
          teamId: team.id,
          startedOn: "2010-01-01",
          endedOn: "2012-12-31",
        },
        {
          playerId: player.id,
          teamId: team.id,
          startedOn: "2014-01-01",
          endedOn: "2015-06-30",
          membershipType: "loan",
        },
        { playerId: player.id, teamId: team.id, startedOn: "2018-01-01" },
      ]);

      const stints = await db
        .select()
        .from(s.playerTeamMemberships)
        .where(eq(s.playerTeamMemberships.playerId, player.id))
        .orderBy(s.playerTeamMemberships.startedOn);

      expect(stints).toHaveLength(3);
      expect(stints.map((x) => x.membershipType)).toEqual([
        "permanent",
        "loan",
        "permanent",
      ]);
      // A passagem em andamento não tem data de fim.
      expect(stints[2]?.endedOn).toBeNull();
    });

    it("rejeita passagem que termina antes de começar", async () => {
      const { team } = await insertClubAndTeam(db);
      const player = await insertPlayer(db, (await insertPerson(db)).id);

      await expectViolation(
        db.insert(s.playerTeamMemberships).values({
          playerId: player.id,
          teamId: team.id,
          startedOn: "2020-01-01",
          endedOn: "2019-12-31",
        }),
        {
          code: CHECK_VIOLATION,
          constraint: "player_team_memberships_period_ck",
        },
      );
    });

    it("um Coach também pode ter várias passagens pelo mesmo Team", async () => {
      const { team } = await insertClubAndTeam(db);
      const coach = await insertCoach(db, (await insertPerson(db)).id);

      await db.insert(s.coachTeamTenures).values([
        {
          coachId: coach.id,
          teamId: team.id,
          startedOn: "2008-01-01",
          endedOn: "2009-12-31",
          role: "head coach",
        },
        {
          coachId: coach.id,
          teamId: team.id,
          startedOn: "2015-01-01",
          role: "head coach",
        },
      ]);

      const tenures = await db
        .select()
        .from(s.coachTeamTenures)
        .where(eq(s.coachTeamTenures.coachId, coach.id));
      expect(tenures).toHaveLength(2);

      await expectViolation(
        db.insert(s.coachTeamTenures).values({
          coachId: coach.id,
          teamId: team.id,
          startedOn: "2020-01-01",
          endedOn: "2019-01-01",
        }),
        { code: CHECK_VIOLATION, constraint: "coach_team_tenures_period_ck" },
      );
    });
  });

  describe("posições", () => {
    it("um Player tem no máximo uma posição principal", async () => {
      const player = await insertPlayer(db, (await insertPerson(db)).id);
      const [a, b, c] = [
        await insertPosition(db),
        await insertPosition(db),
        await insertPosition(db),
      ];

      await db
        .insert(s.playerPositions)
        .values({ playerId: player.id, positionId: a.id, isPrimary: true });
      await db
        .insert(s.playerPositions)
        .values({ playerId: player.id, positionId: b.id, isPrimary: false });

      await expectViolation(
        db
          .insert(s.playerPositions)
          .values({ playerId: player.id, positionId: c.id, isPrimary: true }),
        {
          code: UNIQUE_VIOLATION,
          constraint: "player_positions_one_primary_uq",
        },
      );
      // A mesma posição não entra duas vezes (PK composta).
      await expectViolation(
        db
          .insert(s.playerPositions)
          .values({ playerId: player.id, positionId: a.id }),
        { code: UNIQUE_VIOLATION, constraint: "player_positions_pk" },
      );
    });

    it("apagar um Player remove suas linhas de player_positions (CASCADE)", async () => {
      const player = await insertPlayer(db, (await insertPerson(db)).id);
      const position = await insertPosition(db);
      await db
        .insert(s.playerPositions)
        .values({ playerId: player.id, positionId: position.id });

      await db.delete(s.players).where(eq(s.players.id, player.id));

      const left = await db
        .select()
        .from(s.playerPositions)
        .where(eq(s.playerPositions.playerId, player.id));
      expect(left).toHaveLength(0);
    });
  });

  describe("Competition e CompetitionEdition", () => {
    it("são entidades distintas: uma competição tem várias edições", async () => {
      const competition = await insertCompetition(db);
      const e2025 = await insertEdition(db, competition.id, {
        seasonLabel: "2025",
      });
      const e2026 = await insertEdition(db, competition.id, {
        seasonLabel: "2026",
      });

      // A competição não carrega ano; cada edição é uma linha própria com id próprio.
      expect(competition).not.toHaveProperty("seasonLabel");
      expect(e2025.id).not.toBe(e2026.id);
      expect(e2025.competitionId).toBe(competition.id);
      expect(e2026.competitionId).toBe(competition.id);
    });

    it("uma edição exige uma competição existente", async () => {
      await expectViolation(insertEdition(db, randomUUID()), {
        code: FOREIGN_KEY_VIOLATION,
        constraint: "competition_editions_competition_id_competitions_id_fk",
      });
    });

    it("competition_editions: unicidade por competition + season_label", async () => {
      const competition = await insertCompetition(db);
      const other = await insertCompetition(db);
      await insertEdition(db, competition.id, { seasonLabel: "2026" });

      await expectViolation(
        insertEdition(db, competition.id, { seasonLabel: "2026" }),
        {
          code: UNIQUE_VIOLATION,
          constraint: "competition_editions_competition_season_uq",
        },
      );
      // O mesmo rótulo é permitido em outra competição e outro rótulo na mesma.
      await insertEdition(db, other.id, { seasonLabel: "2026" });
      await insertEdition(db, competition.id, { seasonLabel: "2027" });
    });

    it("rejeita edição que termina antes de começar", async () => {
      const competition = await insertCompetition(db);
      await expectViolation(
        insertEdition(db, competition.id, {
          startsOn: "2026-12-01",
          endsOn: "2026-01-01",
        }),
        { code: CHECK_VIOLATION, constraint: "competition_editions_period_ck" },
      );
    });
  });

  describe("team_seasons", () => {
    it("respeita a unicidade por team + year", async () => {
      const { club, team } = await insertClubAndTeam(db);
      const otherTeam = await insertTeam(db, club.id);
      await insertTeamSeason(db, team.id, 2026);

      await expectViolation(insertTeamSeason(db, team.id, 2026), {
        code: UNIQUE_VIOLATION,
        constraint: "team_seasons_team_year_uq",
      });
      // Outro ano no mesmo time e o mesmo ano em outro time são permitidos.
      await insertTeamSeason(db, team.id, 2027);
      await insertTeamSeason(db, otherTeam.id, 2026);
    });
  });

  describe("Match", () => {
    async function matchContext() {
      const { club, team: home } = await insertClubAndTeam(db);
      const away = await insertTeam(db, club.id);
      const competition = await insertCompetition(db);
      const edition = await insertEdition(db, competition.id);
      return {
        competitionEditionId: edition.id,
        homeTeamId: home.id,
        awayTeamId: away.id,
      };
    }

    it("aceita uma partida válida com defaults coerentes", async () => {
      const match = await insertMatch(db, await matchContext());

      expect(match.status).toBe("scheduled");
      expect(match.datePrecision).toBe("datetime");
      expect(match.kickoffAt).toBeNull();
      expect(match.homeScoreRegular).toBeNull();
    });

    it("não permite home_team_id igual a away_team_id", async () => {
      const ctx = await matchContext();

      await expectViolation(
        insertMatch(db, { ...ctx, awayTeamId: ctx.homeTeamId }),
        { code: CHECK_VIOLATION, constraint: "matches_home_away_different_ck" },
      );
    });

    it("também barra o empate de times em um UPDATE", async () => {
      const ctx = await matchContext();
      const match = await insertMatch(db, ctx);

      await expectViolation(
        db
          .update(s.matches)
          .set({ awayTeamId: ctx.homeTeamId })
          .where(eq(s.matches.id, match.id)),
        { code: CHECK_VIOLATION, constraint: "matches_home_away_different_ck" },
      );
    });

    it("guarda placar regular, prorrogação e pênaltis", async () => {
      const match = await insertMatch(db, {
        ...(await matchContext()),
        status: "finished",
        homeScoreRegular: 1,
        awayScoreRegular: 1,
        homeScoreExtraTime: 1,
        awayScoreExtraTime: 1,
        homeScorePenalties: 4,
        awayScorePenalties: 3,
      });

      expect(match.homeScorePenalties).toBe(4);
      expect(match.awayScorePenalties).toBe(3);
    });

    it("exige placares em par e não negativos", async () => {
      const ctx = await matchContext();

      await expectViolation(insertMatch(db, { ...ctx, homeScoreRegular: 2 }), {
        code: CHECK_VIOLATION,
        constraint: "matches_scores_paired_ck",
      });
      await expectViolation(
        insertMatch(db, { ...ctx, homeScoreRegular: -1, awayScoreRegular: 0 }),
        { code: CHECK_VIOLATION, constraint: "matches_scores_non_negative_ck" },
      );
    });

    it("exige edição, mandante e visitante existentes", async () => {
      const ctx = await matchContext();

      await expectViolation(
        insertMatch(db, { ...ctx, competitionEditionId: randomUUID() }),
        {
          code: FOREIGN_KEY_VIOLATION,
          constraint:
            "matches_competition_edition_id_competition_editions_id_fk",
        },
      );
      await expectViolation(
        insertMatch(db, { ...ctx, awayTeamId: randomUUID() }),
        {
          code: FOREIGN_KEY_VIOLATION,
          constraint: "matches_away_team_id_teams_id_fk",
        },
      );
    });
  });

  describe("enums e formatos", () => {
    it("rejeita valores fora do enum, no tipo e no banco", async () => {
      const club = await insertClub(db);

      await expectViolation(
        // @ts-expect-error "other" não é um Gender: o TypeScript já rejeita
        insertTeam(db, club.id, { gender: "other" }),
        { code: INVALID_ENUM_VALUE },
      );
    });

    it("gender tem exatamente male, female, mixed e unknown", async () => {
      const values = await db.execute<{ value: string }>(
        sql`select unnest(enum_range(null::gender))::text as value`,
      );
      expect([...values].map((row) => row.value)).toEqual([
        "male",
        "female",
        "mixed",
        "unknown",
      ]);

      // O enum é compartilhado por competições e times.
      const club = await insertClub(db);
      const competition = await insertCompetition(db, { gender: "mixed" });
      const team = await insertTeam(db, club.id, { gender: "unknown" });
      expect(competition.gender).toBe("mixed");
      expect(team.gender).toBe("unknown");
    });

    it("rejeita slug fora do formato e código de país inválido", async () => {
      await expectViolation(insertClub(db, { slug: "Slug Inválido" }), {
        code: CHECK_VIOLATION,
        constraint: "clubs_slug_format_ck",
      });
      await expectViolation(insertClub(db, { countryCode: "br" }), {
        code: CHECK_VIOLATION,
        constraint: "clubs_country_code_ck",
      });
    });

    it("rejeita slug duplicado", async () => {
      const club = await insertClub(db);

      await expectViolation(insertClub(db, { slug: club.slug }), {
        code: UNIQUE_VIOLATION,
        constraint: "clubs_slug_unique",
      });
    });
  });

  describe("timestamps", () => {
    it("created_at e updated_at nascem preenchidos e iguais", async () => {
      const club = await insertClub(db);

      expect(club.createdAt).toBeInstanceOf(Date);
      expect(club.updatedAt.getTime()).toBe(club.createdAt.getTime());
    });

    it("updated_at avança quando a linha muda e não muda em UPDATE sem efeito", async () => {
      const club = await insertClub(db);
      const read = async () => {
        const [row] = await db
          .select()
          .from(s.clubs)
          .where(eq(s.clubs.id, club.id));
        if (!row) throw new Error("club sumiu");
        return row;
      };

      await sleep(20);
      await db
        .update(s.clubs)
        .set({ city: "São Paulo" })
        .where(eq(s.clubs.id, club.id));
      const changed = await read();
      expect(changed.updatedAt.getTime()).toBeGreaterThan(
        club.updatedAt.getTime(),
      );
      expect(changed.createdAt.getTime()).toBe(club.createdAt.getTime());

      // Mesmo valor de novo: nada mudou, então updated_at não deve mexer.
      await sleep(20);
      await db
        .update(s.clubs)
        .set({ city: "São Paulo" })
        .where(eq(s.clubs.id, club.id));
      const unchanged = await read();
      expect(unchanged.updatedAt.getTime()).toBe(changed.updatedAt.getTime());
    });
  });

  describe("integridade estrutural do banco", () => {
    it("toda FK tem um índice cobrindo sua coluna (consultas indexadas, spec §47)", async () => {
      const uncovered = await db.execute<{
        table_name: string;
        column_name: string;
      }>(sql`
        select c.conrelid::regclass::text as table_name, a.attname as column_name
        from pg_constraint c
        join pg_attribute a on a.attrelid = c.conrelid and a.attnum = c.conkey[1]
        where c.contype = 'f'
          and c.connamespace = 'public'::regnamespace
          and not exists (
            select 1 from pg_index i
            where i.indrelid = c.conrelid and i.indkey[0] = c.conkey[1]
          )
      `);

      expect([...uncovered]).toEqual([]);
    });

    it("todas as PKs são uuid", async () => {
      const nonUuid = await db.execute<{ table_name: string }>(sql`
        select c.relname as table_name
        from pg_constraint k
        join pg_class c on c.oid = k.conrelid
        join pg_attribute a on a.attrelid = k.conrelid and a.attnum = k.conkey[1]
        where k.contype = 'p'
          and k.connamespace = 'public'::regnamespace
          and array_length(k.conkey, 1) = 1
          and a.atttypid <> 'uuid'::regtype
      `);

      expect([...nonUuid]).toEqual([]);
    });
  });
});
