import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  check,
  date,
  index,
  pgTable,
  primaryKey,
  smallint,
  text,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { positionGroupEnum, preferredFootEnum } from "./enums";
import { isCountryCode, isSlug, primaryId, timestamps } from "./helpers";

/** Pessoa física. Player e Coach são papéis da mesma Person (DEC-016). */
export const people = pgTable(
  "people",
  {
    id: primaryId(),
    fullName: varchar("full_name").notNull(),
    knownName: varchar("known_name"),
    slug: varchar("slug").notNull().unique(),
    birthDate: date("birth_date"),
    deathDate: date("death_date"),
    birthCity: varchar("birth_city"),
    birthCountryCode: char("birth_country_code", { length: 2 }),
    nationalityCode: char("nationality_code", { length: 2 }),
    heightCm: smallint("height_cm"),
    preferredFoot: preferredFootEnum("preferred_foot"),
    photoUrl: text("photo_url"),
    ...timestamps(),
  },
  (t) => [
    check("people_slug_format_ck", isSlug(t.slug)),
    check("people_birth_country_code_ck", isCountryCode(t.birthCountryCode)),
    check("people_nationality_code_ck", isCountryCode(t.nationalityCode)),
    check("people_height_cm_ck", sql`${t.heightCm} > 0`),
    check("people_death_after_birth_ck", sql`${t.deathDate} >= ${t.birthDate}`),
  ],
);

/** Posições padrão (GK, CB, ...). Dados de referência, sem timestamps no spec. */
export const positions = pgTable(
  "positions",
  {
    id: primaryId(),
    code: varchar("code").notNull().unique(),
    name: varchar("name").notNull(),
    groupName: positionGroupEnum("group_name").notNull(),
    sortOrder: smallint("sort_order").notNull(),
  },
  (t) => [check("positions_code_format_ck", sql`${t.code} ~ '^[A-Z]{2,3}$'`)],
);

/** Papel de jogador de uma Person. No máximo um Player por Person. */
export const players = pgTable(
  "players",
  {
    id: primaryId(),
    personId: uuid("person_id")
      .notNull()
      .unique()
      .references(() => people.id, { onDelete: "restrict" }),
    // Opcional: a posição de jogadores históricos pode ser desconhecida.
    primaryPositionId: uuid("primary_position_id").references(
      () => positions.id,
      { onDelete: "restrict" },
    ),
  },
  (t) => [index("players_primary_position_id_idx").on(t.primaryPositionId)],
);

/** Papel de técnico de uma Person. No máximo um Coach por Person. */
export const coaches = pgTable("coaches", {
  id: primaryId(),
  personId: uuid("person_id")
    .notNull()
    .unique()
    .references(() => people.id, { onDelete: "restrict" }),
});

/** Posições em que um jogador atua. No máximo uma delas é a principal. */
export const playerPositions = pgTable(
  "player_positions",
  {
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    positionId: uuid("position_id")
      .notNull()
      .references(() => positions.id, { onDelete: "restrict" }),
    isPrimary: boolean("is_primary").notNull().default(false),
  },
  (t) => [
    primaryKey({
      name: "player_positions_pk",
      columns: [t.playerId, t.positionId],
    }),
    index("player_positions_position_id_idx").on(t.positionId),
    uniqueIndex("player_positions_one_primary_uq")
      .on(t.playerId)
      .where(sql`${t.isPrimary}`),
  ],
);
