import { sql } from "drizzle-orm";
import {
  char,
  check,
  date,
  foreignKey,
  index,
  pgTable,
  primaryKey,
  smallint,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { teams } from "./clubs";
import {
  competitionScopeEnum,
  competitionStatusEnum,
  competitionTypeEnum,
  genderEnum,
} from "./enums";
import { isCountryCode, isSlug, primaryId, timestamps } from "./helpers";

/** A competição em si (ex.: Campeonato Brasileiro). Não tem ano; ver edições. */
export const competitions = pgTable(
  "competitions",
  {
    id: primaryId(),
    name: varchar("name").notNull(),
    shortName: varchar("short_name"),
    slug: varchar("slug").notNull().unique(),
    organizer: varchar("organizer"),
    // NULL para competições internacionais sem país.
    countryCode: char("country_code", { length: 2 }),
    scope: competitionScopeEnum("scope").notNull(),
    competitionType: competitionTypeEnum("competition_type").notNull(),
    gender: genderEnum("gender").notNull(),
    ageCategory: varchar("age_category").notNull().default("senior"),
    ...timestamps(),
  },
  (t) => [
    check("competitions_slug_format_ck", isSlug(t.slug)),
    check("competitions_country_code_ck", isCountryCode(t.countryCode)),
    check("competitions_age_category_ck", sql`length(${t.ageCategory}) > 0`),
  ],
);

/** Uma edição (temporada) de uma competição (ex.: Brasileirão 2026). */
export const competitionEditions = pgTable(
  "competition_editions",
  {
    id: primaryId(),
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitions.id, { onDelete: "restrict" }),
    // Texto livre porque nem toda edição é um ano: "2026", "2025/26".
    seasonLabel: varchar("season_label").notNull(),
    slug: varchar("slug").notNull().unique(),
    startsOn: date("starts_on"),
    endsOn: date("ends_on"),
    format: varchar("format"),
    status: competitionStatusEnum("status").notNull().default("scheduled"),
    ...timestamps(),
  },
  (t) => [
    // A unicidade em (competition, season_label) também serve de índice por competição.
    unique("competition_editions_competition_season_uq").on(
      t.competitionId,
      t.seasonLabel,
    ),
    check("competition_editions_slug_format_ck", isSlug(t.slug)),
    check("competition_editions_period_ck", sql`${t.endsOn} >= ${t.startsOn}`),
  ],
);

/** Times inscritos em uma edição. Sem timestamps no spec. */
export const competitionParticipants = pgTable(
  "competition_participants",
  {
    competitionEditionId: uuid("competition_edition_id").notNull(),
    teamId: uuid("team_id").notNull(),
    groupName: varchar("group_name"),
    seed: smallint("seed"),
    finalPosition: smallint("final_position"),
    status: varchar("status"),
  },
  (t) => [
    primaryKey({
      name: "competition_participants_pk",
      columns: [t.competitionEditionId, t.teamId],
    }),
    // Nomes explícitos: o nome automático passaria de 63 caracteres (limite do
    // PostgreSQL) e seria truncado, divergindo do que o drizzle-kit registra.
    foreignKey({
      name: "competition_participants_edition_fk",
      columns: [t.competitionEditionId],
      foreignColumns: [competitionEditions.id],
    }).onDelete("restrict"),
    foreignKey({
      name: "competition_participants_team_fk",
      columns: [t.teamId],
      foreignColumns: [teams.id],
    }).onDelete("restrict"),
    // O PK já cobre buscas por edição; este cobre "em quais edições o time jogou".
    index("competition_participants_team_id_idx").on(t.teamId),
    check("competition_participants_seed_ck", sql`${t.seed} > 0`),
    check(
      "competition_participants_final_position_ck",
      sql`${t.finalPosition} > 0`,
    ),
  ],
);
