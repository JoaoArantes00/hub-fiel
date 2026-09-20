import { sql } from "drizzle-orm";
import {
  check,
  date,
  pgTable,
  smallint,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { teams } from "./clubs";
import { primaryId } from "./helpers";

/** Temporada de um Team (hub central do produto, DEC-026). Sem timestamps no spec. */
export const teamSeasons = pgTable(
  "team_seasons",
  {
    id: primaryId(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "restrict" }),
    year: smallint("year").notNull(),
    label: varchar("label"),
    startsOn: date("starts_on"),
    endsOn: date("ends_on"),
  },
  (t) => [
    // A unicidade em (team, year) também serve de índice por time.
    unique("team_seasons_team_year_uq").on(t.teamId, t.year),
    check("team_seasons_year_ck", sql`${t.year} >= 1800`),
    check("team_seasons_period_ck", sql`${t.endsOn} >= ${t.startsOn}`),
  ],
);
