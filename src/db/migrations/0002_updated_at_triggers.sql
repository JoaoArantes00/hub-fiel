-- Mantém updated_at no banco, valendo para qualquer caminho de escrita (ORM,
-- SQL manual, INSERT ... ON CONFLICT DO UPDATE dos imports futuros).
-- O trigger só dispara quando a linha realmente muda, para que reexecutar um
-- import idempotente não altere updated_at (PROJECT_SPEC §12.5).
CREATE FUNCTION "set_updated_at"() RETURNS trigger AS $$
BEGIN
	NEW."updated_at" = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER "clubs_set_updated_at" BEFORE UPDATE ON "clubs" FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*) EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "teams_set_updated_at" BEFORE UPDATE ON "teams" FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*) EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "people_set_updated_at" BEFORE UPDATE ON "people" FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*) EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "player_team_memberships_set_updated_at" BEFORE UPDATE ON "player_team_memberships" FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*) EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "coach_team_tenures_set_updated_at" BEFORE UPDATE ON "coach_team_tenures" FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*) EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "competitions_set_updated_at" BEFORE UPDATE ON "competitions" FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*) EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "competition_editions_set_updated_at" BEFORE UPDATE ON "competition_editions" FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*) EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "venues_set_updated_at" BEFORE UPDATE ON "venues" FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*) EXECUTE FUNCTION "set_updated_at"();
--> statement-breakpoint
CREATE TRIGGER "matches_set_updated_at" BEFORE UPDATE ON "matches" FOR EACH ROW WHEN (OLD.* IS DISTINCT FROM NEW.*) EXECUTE FUNCTION "set_updated_at"();
