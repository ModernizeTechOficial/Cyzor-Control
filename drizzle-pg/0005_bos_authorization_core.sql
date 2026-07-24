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
	"tenant_id" uuid NOT NULL,
	"workspace_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "roles_slug_unique" UNIQUE("slug")
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
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role_slug" text NOT NULL,
	"permission_slug" text NOT NULL,
	"tenant_id" uuid NOT NULL,
	"workspace_id" integer,
	"is_inherited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
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
	"tenant_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_slug_roles_slug_fk" FOREIGN KEY ("role_slug") REFERENCES "public"."roles"("slug") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_slug_permissions_slug_fk" FOREIGN KEY ("permission_slug") REFERENCES "public"."permissions"("slug") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "permission_audit_log" ADD CONSTRAINT "permission_audit_log_actor_uid_users_uid_fk" FOREIGN KEY ("actor_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "roles_slug_idx" ON "roles" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX "roles_tenant_idx" ON "roles" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "roles_parent_idx" ON "roles" USING btree ("parent_role_slug");
--> statement-breakpoint
CREATE INDEX "permissions_module_idx" ON "permissions" USING btree ("module");
--> statement-breakpoint
CREATE INDEX "permissions_resource_idx" ON "permissions" USING btree ("resource");
--> statement-breakpoint
CREATE INDEX "role_permissions_role_idx" ON "role_permissions" USING btree ("role_slug","permission_slug");
--> statement-breakpoint
CREATE INDEX "role_permissions_tenant_idx" ON "role_permissions" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "modules_slug_idx" ON "modules" USING btree ("slug");
--> statement-breakpoint
CREATE INDEX "modules_tenant_idx" ON "modules" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "feature_flags_key_scope_idx" ON "feature_flags" USING btree ("key","scope");
--> statement-breakpoint
CREATE INDEX "feature_flags_tenant_idx" ON "feature_flags" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "feature_flags_workspace_idx" ON "feature_flags" USING btree ("workspace_id");
--> statement-breakpoint
CREATE INDEX "permission_audit_log_tenant_idx" ON "permission_audit_log" USING btree ("tenant_id");
--> statement-breakpoint
CREATE INDEX "permission_audit_log_workspace_idx" ON "permission_audit_log" USING btree ("workspace_id");
