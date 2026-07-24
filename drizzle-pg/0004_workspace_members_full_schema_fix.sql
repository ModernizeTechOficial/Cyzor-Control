ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "department" text;
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "team_name" text;
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "manager_uid" text REFERENCES "public"."users"("uid") ON DELETE SET NULL;
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "permissions" jsonb DEFAULT '[]'::jsonb;
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "status" text DEFAULT 'Ativo';
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean DEFAULT false;
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "xp" integer DEFAULT 0;
ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "career_level" text DEFAULT 'Pleno';

ALTER TABLE "workspace_members" DROP CONSTRAINT IF EXISTS workspace_members_workspace_id_unique;
DROP INDEX IF EXISTS workspace_members_workspace_id_unique;

CREATE INDEX IF NOT EXISTS ws_members_ws_user_idx ON "workspace_members" ("workspace_id", "user_uid");
CREATE INDEX IF NOT EXISTS ws_members_user_idx ON "workspace_members" ("user_uid");
CREATE INDEX IF NOT EXISTS workspace_members_tenant_idx ON "workspace_members" ("tenant_id");
