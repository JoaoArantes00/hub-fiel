import { pgEnum } from "drizzle-orm/pg-core";

// O spec (§15) só diz "enum". Os conjuntos abaixo são deliberadamente mínimos:
// no PostgreSQL adicionar um valor depois é fácil (ALTER TYPE ... ADD VALUE),
// removê-lo não é. Ver docs/DECISIONS.md (F1-02).

/**
 * Gênero de times e competições. `mixed` e `unknown` foram definidos pelo dono
 * do projeto (o spec só diz "enum"); ver docs/DECISIONS.md (F1-02).
 */
export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "mixed",
  "unknown",
]);

/** Nível do time: profissional ou base. A faixa etária fica em `age_category`. */
export const teamLevelEnum = pgEnum("team_level", ["professional", "youth"]);

export const preferredFootEnum = pgEnum("preferred_foot", [
  "left",
  "right",
  "both",
]);

export const positionGroupEnum = pgEnum("position_group", [
  "goalkeeper",
  "defender",
  "midfielder",
  "forward",
]);

export const membershipTypeEnum = pgEnum("membership_type", [
  "permanent",
  "loan",
  "unknown",
]);

export const competitionScopeEnum = pgEnum("competition_scope", [
  "state",
  "regional",
  "national",
  "continental",
  "world",
]);

export const competitionTypeEnum = pgEnum("competition_type", [
  "league",
  "cup",
  "friendly",
]);

export const competitionStatusEnum = pgEnum("competition_status", [
  "scheduled",
  "ongoing",
  "finished",
  "cancelled",
]);

/**
 * Até que nível a data é conhecida. Partidas antigas podem ter só o ano;
 * `kickoff_at` guarda então um instante representativo e este campo diz o
 * quanto dele é confiável.
 */
export const datePrecisionEnum = pgEnum("date_precision", [
  "datetime",
  "day",
  "month",
  "year",
]);

export const matchStatusEnum = pgEnum("match_status", [
  "scheduled",
  "live",
  "finished",
  "postponed",
  "suspended",
  "abandoned",
  "cancelled",
  "awarded",
]);

export type Gender = (typeof genderEnum.enumValues)[number];
export type TeamLevel = (typeof teamLevelEnum.enumValues)[number];
export type PreferredFoot = (typeof preferredFootEnum.enumValues)[number];
export type PositionGroup = (typeof positionGroupEnum.enumValues)[number];
export type MembershipType = (typeof membershipTypeEnum.enumValues)[number];
export type CompetitionScope = (typeof competitionScopeEnum.enumValues)[number];
export type CompetitionType = (typeof competitionTypeEnum.enumValues)[number];
export type CompetitionStatus =
  (typeof competitionStatusEnum.enumValues)[number];
export type DatePrecision = (typeof datePrecisionEnum.enumValues)[number];
export type MatchStatus = (typeof matchStatusEnum.enumValues)[number];
