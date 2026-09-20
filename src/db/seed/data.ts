import type { clubs, positions, teams } from "../schema";

// Dados de referência do seed inicial (PROJECT_SPEC §50). Nenhum ID aparece
// aqui: os UUIDs são gerados pelo banco e as relações usam chaves naturais
// (slug do club, code da posição).

export const CLUB_SLUG = "corinthians";

export const CLUB_SEED = {
  name: "Corinthians",
  fullName: "Sport Club Corinthians Paulista",
  shortName: "Corinthians",
  slug: CLUB_SLUG,
  foundedOn: "1910-09-01",
  city: "São Paulo",
  state: "SP",
  countryCode: "BR",
} satisfies typeof clubs.$inferInsert;

export const TEAM_SEEDS = [
  {
    name: "Corinthians Masculino",
    slug: "corinthians-masculino",
    gender: "male",
    ageCategory: "senior",
    level: "professional",
  },
  {
    name: "Corinthians Feminino",
    slug: "corinthians-feminino",
    gender: "female",
    ageCategory: "senior",
    level: "professional",
  },
  {
    name: "Corinthians Sub-20",
    slug: "corinthians-sub-20",
    gender: "male",
    ageCategory: "U20",
    level: "youth",
  },
] satisfies Omit<typeof teams.$inferInsert, "clubId">[];

export const POSITION_SEEDS = [
  { code: "GK", name: "Goleiro", groupName: "goalkeeper", sortOrder: 1 },
  { code: "CB", name: "Zagueiro", groupName: "defender", sortOrder: 2 },
  { code: "LB", name: "Lateral-esquerdo", groupName: "defender", sortOrder: 3 },
  { code: "RB", name: "Lateral-direito", groupName: "defender", sortOrder: 4 },
  { code: "DM", name: "Volante", groupName: "midfielder", sortOrder: 5 },
  { code: "CM", name: "Meio-campista", groupName: "midfielder", sortOrder: 6 },
  { code: "AM", name: "Meia-atacante", groupName: "midfielder", sortOrder: 7 },
  { code: "LW", name: "Ponta-esquerda", groupName: "forward", sortOrder: 8 },
  { code: "RW", name: "Ponta-direita", groupName: "forward", sortOrder: 9 },
  { code: "ST", name: "Centroavante", groupName: "forward", sortOrder: 10 },
] satisfies (typeof positions.$inferInsert)[];
