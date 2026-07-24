CREATE TABLE "actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "actions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "assignment_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"role" text,
	"member_type" text DEFAULT 'TEAM',
	"member_ref" text,
	"permission_set" jsonb DEFAULT '[]',
	"default_resources" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" integer NOT NULL,
	"member_id" integer,
	"member_type" text DEFAULT 'MEMBER',
	"member_ref" text,
	"role" text,
	"permission_set" jsonb DEFAULT '[]',
	"visibility_scope" text DEFAULT 'Private',
	"assigned_by" text,
	"assigned_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'ACTIVE'
);
--> statement-breakpoint
CREATE TABLE "feature_flags" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_enabled" boolean DEFAULT false,
	"scope" text DEFAULT 'workspace',
	"tenant_id" uuid,
	"workspace_id" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text DEFAULT 'box',
	"category" text DEFAULT 'general',
	"version" text DEFAULT '1.0.0',
	"status" text DEFAULT 'active',
	"is_system" boolean DEFAULT false,
	"dependencies" jsonb DEFAULT '[]'::jsonb,
	"manifest" jsonb DEFAULT '{}'::jsonb,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "modules_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "permission_audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workspace_id" integer,
	"actor_uid" text NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"module" text NOT NULL,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "permissions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "professional_certifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workspace_id" integer NOT NULL,
	"user_uid" text NOT NULL,
	"name" text NOT NULL,
	"issuer" text,
	"obtained_at" timestamp,
	"expires_at" timestamp,
	"credential_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "professional_evolution_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workspace_id" integer NOT NULL,
	"user_uid" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb DEFAULT '{}',
	"xp_delta" integer DEFAULT 0,
	"skill_deltas" jsonb DEFAULT '[]',
	"achievement_keys" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "professional_evolution_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"event_type" text NOT NULL,
	"xp_delta" integer DEFAULT 0 NOT NULL,
	"skill_deltas" jsonb DEFAULT '[]',
	"achievement_keys" jsonb DEFAULT '[]',
	"active" boolean DEFAULT true,
	"criteria" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "professional_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workspace_id" integer NOT NULL,
	"user_uid" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'OPEN',
	"target_date" timestamp,
	"progress" integer DEFAULT 0,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "professional_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workspace_id" integer NOT NULL,
	"user_uid" text NOT NULL,
	"title" text DEFAULT 'Aprendiz',
	"level" integer DEFAULT 1,
	"xp_total" integer DEFAULT 0,
	"xp_month" integer DEFAULT 0,
	"xp_week" integer DEFAULT 0,
	"xp_today" integer DEFAULT 0,
	"next_level_xp" integer DEFAULT 100,
	"competencies" jsonb DEFAULT '{}',
	"achievements" jsonb DEFAULT '[]',
	"statistics" jsonb DEFAULT '{}',
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"module_slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"table_name" text,
	"is_active" boolean DEFAULT true,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_slug" text NOT NULL,
	"permission_slug" text NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer,
	"is_inherited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#64748B',
	"icon" text DEFAULT 'user',
	"is_system" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"parent_role_slug" text,
	"priority" integer DEFAULT 0,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "workspace_departments" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"lead_uid" text,
	"health_score" integer DEFAULT 85,
	"kpis" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workspace_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"goal" text,
	"lead_uid" text,
	"department" text,
	"health_score" integer DEFAULT 85,
	"career_hub_avg" real DEFAULT 80,
	"kpis" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ai_providers" ALTER COLUMN "workspace_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "linkedin" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "instagram" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "facebook" text;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD COLUMN "payment_date" timestamp;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD COLUMN "team_name" text;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD COLUMN "cargo" text;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD COLUMN "manager_uid" text;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD COLUMN "custom_message" text;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD COLUMN "permissions" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD COLUMN "usage_limit" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD COLUMN "used_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD COLUMN "department" text;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD COLUMN "team_name" text;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD COLUMN "manager_uid" text;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD COLUMN "permissions" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD COLUMN "onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD COLUMN "xp" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD COLUMN "career_level" text DEFAULT 'Pleno';--> statement-breakpoint
ALTER TABLE "assignment_templates" ADD CONSTRAINT "assignment_templates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_member_id_workspace_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."workspace_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_assigned_by_users_uid_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_actor_uid_users_uid_fk" FOREIGN KEY ("actor_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_certifications" ADD CONSTRAINT "professional_certifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_certifications" ADD CONSTRAINT "professional_certifications_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_evolution_events" ADD CONSTRAINT "professional_evolution_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_evolution_events" ADD CONSTRAINT "professional_evolution_events_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_evolution_rules" ADD CONSTRAINT "professional_evolution_rules_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_goals" ADD CONSTRAINT "professional_goals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_goals" ADD CONSTRAINT "professional_goals_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_profiles" ADD CONSTRAINT "professional_profiles_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_module_slug_modules_slug_fk" FOREIGN KEY ("module_slug") REFERENCES "public"."modules"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resources" ADD CONSTRAINT "resources_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_slug_roles_slug_fk" FOREIGN KEY ("role_slug") REFERENCES "public"."roles"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_slug_permissions_slug_fk" FOREIGN KEY ("permission_slug") REFERENCES "public"."permissions"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_departments" ADD CONSTRAINT "workspace_departments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_departments" ADD CONSTRAINT "workspace_departments_lead_uid_users_uid_fk" FOREIGN KEY ("lead_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_teams" ADD CONSTRAINT "workspace_teams_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_teams" ADD CONSTRAINT "workspace_teams_lead_uid_users_uid_fk" FOREIGN KEY ("lead_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assignment_templates_ws_idx" ON "assignment_templates" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "assignments_ws_idx" ON "assignments" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "assignments_resource_idx" ON "assignments" USING btree ("resource_type","resource_id");--> statement-breakpoint
CREATE INDEX "assignments_member_idx" ON "assignments" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "feature_flags_key_scope_idx" ON "feature_flags" USING btree ("key","scope");--> statement-breakpoint
CREATE INDEX "feature_flags_tenant_idx" ON "feature_flags" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "feature_flags_workspace_idx" ON "feature_flags" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "modules_slug_idx" ON "modules" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "modules_tenant_idx" ON "modules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "perm_audit_tenant_idx" ON "permission_audit_log" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "perm_audit_target_idx" ON "permission_audit_log" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "perm_audit_actor_idx" ON "permission_audit_log" USING btree ("actor_uid");--> statement-breakpoint
CREATE INDEX "permissions_slug_idx" ON "permissions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "permissions_module_idx" ON "permissions" USING btree ("module");--> statement-breakpoint
CREATE INDEX "permissions_resource_idx" ON "permissions" USING btree ("resource");--> statement-breakpoint
CREATE INDEX "professional_certifications_user_ws_idx" ON "professional_certifications" USING btree ("user_uid","workspace_id");--> statement-breakpoint
CREATE INDEX "professional_evolution_events_user_ws_idx" ON "professional_evolution_events" USING btree ("user_uid","workspace_id");--> statement-breakpoint
CREATE INDEX "professional_evolution_rules_ws_idx" ON "professional_evolution_rules" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "professional_goals_user_ws_idx" ON "professional_goals" USING btree ("user_uid","workspace_id");--> statement-breakpoint
CREATE INDEX "professional_profiles_user_ws_idx" ON "professional_profiles" USING btree ("user_uid","workspace_id");--> statement-breakpoint
CREATE INDEX "resources_slug_idx" ON "resources" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "resources_module_idx" ON "resources" USING btree ("module_slug");--> statement-breakpoint
CREATE INDEX "resources_tenant_idx" ON "resources" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role_slug","permission_slug");--> statement-breakpoint
CREATE INDEX "role_permissions_tenant_idx" ON "role_permissions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "roles_slug_idx" ON "roles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "roles_tenant_idx" ON "roles" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "roles_parent_idx" ON "roles" USING btree ("parent_role_slug");--> statement-breakpoint
CREATE INDEX "ws_dept_ws_idx" ON "workspace_departments" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "ws_dept_tenant_idx" ON "workspace_departments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ws_teams_ws_idx" ON "workspace_teams" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "ws_teams_tenant_idx" ON "workspace_teams" USING btree ("tenant_id");--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_manager_uid_users_uid_fk" FOREIGN KEY ("manager_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_manager_uid_users_uid_fk" FOREIGN KEY ("manager_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;