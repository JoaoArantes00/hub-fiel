import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { teams } from "./clubs";
import { competitionEditions } from "./competitions";
import { datePrecisionEnum, matchStatusEnum } from "./enums";
import { primaryId, timestamps } from "./helpers";
import { teamSeasons } from "./seasons";
import { venues } from "./venues";

/**
 * Partida: unidade factual central (DEC-018). Guarda só fatos; eventos,
 * escalações e estatísticas entram em fases posteriores.
 *
 * `team_season_id` aponta para a temporada do time "de interesse" (o
 * Corinthians) e é opcional; o vínculo com home/away não é imposto pelo banco.
 */
export const matches = pgTable(
  "matches",
  {
    id: primaryId(),
    competitionEditionId: uuid("competition_edition_id")
      .notNull()
      .references(() => competitionEditions.id, { onDelete: "restrict" }),
    teamSeasonId: uuid("team_season_id").references(() => teamSeasons.id, {
      onDelete: "restrict",
    }),
    stage: varchar("stage"),
    round: varchar("round"),
    leg: smallint("leg"),

    // NULL quando o horário/data ainda não foi definido (jogo "a definir").
    kickoffAt: timestamp("kickoff_at", { withTimezone: true }),
    datePrecision: datePrecisionEnum("date_precision")
      .notNull()
      .default("datetime"),

    venueId: uuid("venue_id").references(() => venues.id, {
      onDelete: "restrict",
    }),

    homeTeamId: uuid("home_team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "restrict" }),
    awayTeamId: uuid("away_team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "restrict" }),

    status: matchStatusEnum("status").notNull().default("scheduled"),

    homeScoreRegular: smallint("home_score_regular"),
    awayScoreRegular: smallint("away_score_regular"),
    homeScoreExtraTime: smallint("home_score_extra_time"),
    awayScoreExtraTime: smallint("away_score_extra_time"),
    homeScorePenalties: smallint("home_score_penalties"),
    awayScorePenalties: smallint("away_score_penalties"),

    attendance: integer("attendance"),
    refereeName: varchar("referee_name"),
    notes: text("notes"),
    ...timestamps(),
  },
  (t) => [
    index("matches_competition_edition_id_idx").on(t.competitionEditionId),
    index("matches_team_season_id_idx").on(t.teamSeasonId),
    index("matches_venue_id_idx").on(t.venueId),
    index("matches_home_team_id_idx").on(t.homeTeamId),
    index("matches_away_team_id_idx").on(t.awayTeamId),
    index("matches_kickoff_at_idx").on(t.kickoffAt),

    // Regra do spec §15.
    check(
      "matches_home_away_different_ck",
      sql`${t.homeTeamId} <> ${t.awayTeamId}`,
    ),

    check("matches_leg_ck", sql`${t.leg} > 0`),
    check("matches_attendance_ck", sql`${t.attendance} >= 0`),

    // Placares nunca são negativos (NULL = ainda sem placar, e passa no CHECK).
    check(
      "matches_scores_non_negative_ck",
      sql`${t.homeScoreRegular} >= 0 and ${t.awayScoreRegular} >= 0
        and ${t.homeScoreExtraTime} >= 0 and ${t.awayScoreExtraTime} >= 0
        and ${t.homeScorePenalties} >= 0 and ${t.awayScorePenalties} >= 0`,
    ),
    // ...e vêm sempre em par (mandante e visitante), nunca só um lado.
    check(
      "matches_scores_paired_ck",
      sql`(${t.homeScoreRegular} is null) = (${t.awayScoreRegular} is null)
        and (${t.homeScoreExtraTime} is null) = (${t.awayScoreExtraTime} is null)
        and (${t.homeScorePenalties} is null) = (${t.awayScorePenalties} is null)`,
    ),
  ],
);
