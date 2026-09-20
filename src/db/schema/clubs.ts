import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  date,
  index,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { genderEnum, teamLevelEnum } from "./enums";
import { isCountryCode, isSlug, primaryId, timestamps } from "./helpers";

/** Instituição (ex.: Sport Club Corinthians Paulista). Um Club tem vários Teams. */
export const clubs = pgTable(
  "clubs",
  {
    id: primaryId(),
    name: varchar("name").notNull(),
    fullName: varchar("full_name"),
    shortName: varchar("short_name"),
    slug: varchar("slug").notNull().unique(),
    foundedOn: date("founded_on"),
    city: varchar("city"),
    state: varchar("state"),
    countryCode: char("country_code", { length: 2 }),
    crestUrl: text("crest_url"),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (t) => [
    check("clubs_slug_format_ck", isSlug(t.slug)),
    check("clubs_country_code_ck", isCountryCode(t.countryCode)),
  ],
);

/**
 * Equipe de um Club (masculino, feminino, Sub-20...). Categorias são
 * representadas por Team (DEC-015), não por campos no Club.
 */
export const teams = pgTable(
  "teams",
  {
    id: primaryId(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "restrict" }),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull().unique(),
    gender: genderEnum("gender").notNull(),
    // 'senior' para o profissional; 'U20', 'U17'... para a base.
    ageCategory: varchar("age_category").notNull().default("senior"),
    level: teamLevelEnum("level").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    ...timestamps(),
  },
  (t) => [
    index("teams_club_id_idx").on(t.clubId),
    check("teams_slug_format_ck", isSlug(t.slug)),
    check("teams_age_category_ck", sql`length(${t.ageCategory}) > 0`),
  ],
);
