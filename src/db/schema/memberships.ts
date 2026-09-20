import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { membershipTypeEnum } from "./enums";
import { primaryId, timestamps } from "./helpers";
import { coaches, players } from "./people";
import { teams } from "./clubs";

/**
 * Passagem de um jogador por um time (DEC-017). Não há unicidade em
 * (player, team): o mesmo jogador pode voltar ao mesmo time várias vezes.
 * `started_on` desconhecido = NULL; `ended_on` NULL = passagem em andamento.
 */
export const playerTeamMemberships = pgTable(
  "player_team_memberships",
  {
    id: primaryId(),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "restrict" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "restrict" }),
    startedOn: date("started_on"),
    endedOn: date("ended_on"),
    shirtNumber: varchar("shirt_number"),
    membershipType: membershipTypeEnum("membership_type")
      .notNull()
      .default("permanent"),
    notes: text("notes"),
    ...timestamps(),
  },
  (t) => [
    index("player_team_memberships_player_id_idx").on(t.playerId),
    index("player_team_memberships_team_id_idx").on(t.teamId),
    check(
      "player_team_memberships_period_ck",
      sql`${t.endedOn} >= ${t.startedOn}`,
    ),
  ],
);

/** Passagem de um técnico por um time (DEC-017). Mesmas regras de datas. */
export const coachTeamTenures = pgTable(
  "coach_team_tenures",
  {
    id: primaryId(),
    coachId: uuid("coach_id")
      .notNull()
      .references(() => coaches.id, { onDelete: "restrict" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "restrict" }),
    startedOn: date("started_on"),
    endedOn: date("ended_on"),
    role: varchar("role"),
    ...timestamps(),
  },
  (t) => [
    index("coach_team_tenures_coach_id_idx").on(t.coachId),
    index("coach_team_tenures_team_id_idx").on(t.teamId),
    check("coach_team_tenures_period_ck", sql`${t.endedOn} >= ${t.startedOn}`),
  ],
);
