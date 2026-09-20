import { sql } from "drizzle-orm";
import {
  char,
  check,
  integer,
  numeric,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";
import { isCountryCode, isSlug, primaryId, timestamps } from "./helpers";

/** Estádio. */
export const venues = pgTable(
  "venues",
  {
    id: primaryId(),
    name: varchar("name").notNull(),
    slug: varchar("slug").notNull().unique(),
    city: varchar("city"),
    state: varchar("state"),
    countryCode: char("country_code", { length: 2 }),
    capacity: integer("capacity"),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 9, scale: 6 }),
    ...timestamps(),
  },
  (t) => [
    check("venues_slug_format_ck", isSlug(t.slug)),
    check("venues_country_code_ck", isCountryCode(t.countryCode)),
    check("venues_capacity_ck", sql`${t.capacity} > 0`),
    check("venues_latitude_ck", sql`${t.latitude} between -90 and 90`),
    check("venues_longitude_ck", sql`${t.longitude} between -180 and 180`),
  ],
);
