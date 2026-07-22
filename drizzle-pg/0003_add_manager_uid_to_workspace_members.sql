ALTER TABLE "workspace_members" ADD COLUMN IF NOT EXISTS "manager_uid" text REFERENCES "public"."users"("uid") ON DELETE set null;--> statement-breakpoint
