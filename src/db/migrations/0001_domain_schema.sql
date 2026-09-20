CREATE TYPE "public"."competition_scope" AS ENUM('state', 'regional', 'national', 'continental', 'world');--> statement-breakpoint
CREATE TYPE "public"."competition_status" AS ENUM('scheduled', 'ongoing', 'finished', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."competition_type" AS ENUM('league', 'cup', 'friendly');--> statement-breakpoint
CREATE TYPE "public"."date_precision" AS ENUM('datetime', 'day', 'month', 'year');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'mixed', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'live', 'finished', 'postponed', 'suspended', 'abandoned', 'cancelled', 'awarded');--> statement-breakpoint
CREATE TYPE "public"."membership_type" AS ENUM('permanent', 'loan', 'unknown');--> statement-breakpoint
CREATE TYPE "public"."position_group" AS ENUM('goalkeeper', 'defender', 'midfielder', 'forward');--> statement-breakpoint
CREATE TYPE "public"."preferred_foot" AS ENUM('left', 'right', 'both');--> statement-breakpoint
CREATE TYPE "public"."team_level" AS ENUM('professional', 'youth');--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"full_name" varchar,
	"short_name" varchar,
	"slug" varchar NOT NULL,
	"founded_on" date,
	"city" varchar,
	"state" varchar,
	"country_code" char(2),
	"crest_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "clubs_slug_unique" UNIQUE("slug"),
	CONSTRAINT "clubs_slug_format_ck" CHECK ("clubs"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "clubs_country_code_ck" CHECK ("clubs"."country_code" ~ '^[A-Z]{2}$')
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"gender" "gender" NOT NULL,
	"age_category" varchar DEFAULT 'senior' NOT NULL,
	"level" "team_level" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "teams_slug_unique" UNIQUE("slug"),
	CONSTRAINT "teams_slug_format_ck" CHECK ("teams"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "teams_age_category_ck" CHECK (length("teams"."age_category") > 0)
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	CONSTRAINT "coaches_person_id_unique" UNIQUE("person_id")
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar NOT NULL,
	"known_name" varchar,
	"slug" varchar NOT NULL,
	"birth_date" date,
	"death_date" date,
	"birth_city" varchar,
	"birth_country_code" char(2),
	"nationality_code" char(2),
	"height_cm" smallint,
	"preferred_foot" "preferred_foot",
	"photo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "people_slug_unique" UNIQUE("slug"),
	CONSTRAINT "people_slug_format_ck" CHECK ("people"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "people_birth_country_code_ck" CHECK ("people"."birth_country_code" ~ '^[A-Z]{2}$'),
	CONSTRAINT "people_nationality_code_ck" CHECK ("people"."nationality_code" ~ '^[A-Z]{2}$'),
	CONSTRAINT "people_height_cm_ck" CHECK ("people"."height_cm" > 0),
	CONSTRAINT "people_death_after_birth_ck" CHECK ("people"."death_date" >= "people"."birth_date")
);
--> statement-breakpoint
CREATE TABLE "player_positions" (
	"player_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "player_positions_pk" PRIMARY KEY("player_id","position_id")
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"primary_position_id" uuid,
	CONSTRAINT "players_person_id_unique" UNIQUE("person_id")
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"group_name" "position_group" NOT NULL,
	"sort_order" smallint NOT NULL,
	CONSTRAINT "positions_code_unique" UNIQUE("code"),
	CONSTRAINT "positions_code_format_ck" CHECK ("positions"."code" ~ '^[A-Z]{2,3}$')
);
--> statement-breakpoint
CREATE TABLE "coach_team_tenures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coach_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"started_on" date,
	"ended_on" date,
	"role" varchar,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coach_team_tenures_period_ck" CHECK ("coach_team_tenures"."ended_on" >= "coach_team_tenures"."started_on")
);
--> statement-breakpoint
CREATE TABLE "player_team_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"player_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"started_on" date,
	"ended_on" date,
	"shirt_number" varchar,
	"membership_type" "membership_type" DEFAULT 'permanent' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "player_team_memberships_period_ck" CHECK ("player_team_memberships"."ended_on" >= "player_team_memberships"."started_on")
);
--> statement-breakpoint
CREATE TABLE "competition_editions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"season_label" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"starts_on" date,
	"ends_on" date,
	"format" varchar,
	"status" "competition_status" DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competition_editions_slug_unique" UNIQUE("slug"),
	CONSTRAINT "competition_editions_competition_season_uq" UNIQUE("competition_id","season_label"),
	CONSTRAINT "competition_editions_slug_format_ck" CHECK ("competition_editions"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "competition_editions_period_ck" CHECK ("competition_editions"."ends_on" >= "competition_editions"."starts_on")
);
--> statement-breakpoint
CREATE TABLE "competition_participants" (
	"competition_edition_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"group_name" varchar,
	"seed" smallint,
	"final_position" smallint,
	"status" varchar,
	CONSTRAINT "competition_participants_pk" PRIMARY KEY("competition_edition_id","team_id"),
	CONSTRAINT "competition_participants_seed_ck" CHECK ("competition_participants"."seed" > 0),
	CONSTRAINT "competition_participants_final_position_ck" CHECK ("competition_participants"."final_position" > 0)
);
--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"short_name" varchar,
	"slug" varchar NOT NULL,
	"organizer" varchar,
	"country_code" char(2),
	"scope" "competition_scope" NOT NULL,
	"competition_type" "competition_type" NOT NULL,
	"gender" "gender" NOT NULL,
	"age_category" varchar DEFAULT 'senior' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "competitions_slug_unique" UNIQUE("slug"),
	CONSTRAINT "competitions_slug_format_ck" CHECK ("competitions"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "competitions_country_code_ck" CHECK ("competitions"."country_code" ~ '^[A-Z]{2}$'),
	CONSTRAINT "competitions_age_category_ck" CHECK (length("competitions"."age_category") > 0)
);
--> statement-breakpoint
CREATE TABLE "team_seasons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"year" smallint NOT NULL,
	"label" varchar,
	"starts_on" date,
	"ends_on" date,
	CONSTRAINT "team_seasons_team_year_uq" UNIQUE("team_id","year"),
	CONSTRAINT "team_seasons_year_ck" CHECK ("team_seasons"."year" >= 1800),
	CONSTRAINT "team_seasons_period_ck" CHECK ("team_seasons"."ends_on" >= "team_seasons"."starts_on")
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"city" varchar,
	"state" varchar,
	"country_code" char(2),
	"capacity" integer,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "venues_slug_unique" UNIQUE("slug"),
	CONSTRAINT "venues_slug_format_ck" CHECK ("venues"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "venues_country_code_ck" CHECK ("venues"."country_code" ~ '^[A-Z]{2}$'),
	CONSTRAINT "venues_capacity_ck" CHECK ("venues"."capacity" > 0),
	CONSTRAINT "venues_latitude_ck" CHECK ("venues"."latitude" between -90 and 90),
	CONSTRAINT "venues_longitude_ck" CHECK ("venues"."longitude" between -180 and 180)
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_edition_id" uuid NOT NULL,
	"team_season_id" uuid,
	"stage" varchar,
	"round" varchar,
	"leg" smallint,
	"kickoff_at" timestamp with time zone,
	"date_precision" date_precision DEFAULT 'datetime' NOT NULL,
	"venue_id" uuid,
	"home_team_id" uuid NOT NULL,
	"away_team_id" uuid NOT NULL,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"home_score_regular" smallint,
	"away_score_regular" smallint,
	"home_score_extra_time" smallint,
	"away_score_extra_time" smallint,
	"home_score_penalties" smallint,
	"away_score_penalties" smallint,
	"attendance" integer,
	"referee_name" varchar,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matches_home_away_different_ck" CHECK ("matches"."home_team_id" <> "matches"."away_team_id"),
	CONSTRAINT "matches_leg_ck" CHECK ("matches"."leg" > 0),
	CONSTRAINT "matches_attendance_ck" CHECK ("matches"."attendance" >= 0),
	CONSTRAINT "matches_scores_non_negative_ck" CHECK ("matches"."home_score_regular" >= 0 and "matches"."away_score_regular" >= 0
        and "matches"."home_score_extra_time" >= 0 and "matches"."away_score_extra_time" >= 0
        and "matches"."home_score_penalties" >= 0 and "matches"."away_score_penalties" >= 0),
	CONSTRAINT "matches_scores_paired_ck" CHECK (("matches"."home_score_regular" is null) = ("matches"."away_score_regular" is null)
        and ("matches"."home_score_extra_time" is null) = ("matches"."away_score_extra_time" is null)
        and ("matches"."home_score_penalties" is null) = ("matches"."away_score_penalties" is null))
);
--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_positions" ADD CONSTRAINT "player_positions_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_positions" ADD CONSTRAINT "player_positions_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_primary_position_id_positions_id_fk" FOREIGN KEY ("primary_position_id") REFERENCES "public"."positions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_team_tenures" ADD CONSTRAINT "coach_team_tenures_coach_id_coaches_id_fk" FOREIGN KEY ("coach_id") REFERENCES "public"."coaches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_team_tenures" ADD CONSTRAINT "coach_team_tenures_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_team_memberships" ADD CONSTRAINT "player_team_memberships_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_team_memberships" ADD CONSTRAINT "player_team_memberships_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_editions" ADD CONSTRAINT "competition_editions_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_participants" ADD CONSTRAINT "competition_participants_edition_fk" FOREIGN KEY ("competition_edition_id") REFERENCES "public"."competition_editions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_participants" ADD CONSTRAINT "competition_participants_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_seasons" ADD CONSTRAINT "team_seasons_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_edition_id_competition_editions_id_fk" FOREIGN KEY ("competition_edition_id") REFERENCES "public"."competition_editions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_season_id_team_seasons_id_fk" FOREIGN KEY ("team_season_id") REFERENCES "public"."team_seasons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "teams_club_id_idx" ON "teams" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "player_positions_position_id_idx" ON "player_positions" USING btree ("position_id");--> statement-breakpoint
CREATE UNIQUE INDEX "player_positions_one_primary_uq" ON "player_positions" USING btree ("player_id") WHERE "player_positions"."is_primary";--> statement-breakpoint
CREATE INDEX "players_primary_position_id_idx" ON "players" USING btree ("primary_position_id");--> statement-breakpoint
CREATE INDEX "coach_team_tenures_coach_id_idx" ON "coach_team_tenures" USING btree ("coach_id");--> statement-breakpoint
CREATE INDEX "coach_team_tenures_team_id_idx" ON "coach_team_tenures" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "player_team_memberships_player_id_idx" ON "player_team_memberships" USING btree ("player_id");--> statement-breakpoint
CREATE INDEX "player_team_memberships_team_id_idx" ON "player_team_memberships" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "competition_participants_team_id_idx" ON "competition_participants" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "matches_competition_edition_id_idx" ON "matches" USING btree ("competition_edition_id");--> statement-breakpoint
CREATE INDEX "matches_team_season_id_idx" ON "matches" USING btree ("team_season_id");--> statement-breakpoint
CREATE INDEX "matches_venue_id_idx" ON "matches" USING btree ("venue_id");--> statement-breakpoint
CREATE INDEX "matches_home_team_id_idx" ON "matches" USING btree ("home_team_id");--> statement-breakpoint
CREATE INDEX "matches_away_team_id_idx" ON "matches" USING btree ("away_team_id");--> statement-breakpoint
CREATE INDEX "matches_kickoff_at_idx" ON "matches" USING btree ("kickoff_at");