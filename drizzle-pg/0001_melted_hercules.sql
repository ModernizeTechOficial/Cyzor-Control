CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"table" text NOT NULL,
	"record_id" text NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'Active',
	"plan" text DEFAULT 'Free',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tenant_id" uuid NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"is_owner" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agenda_events" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_history" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_memories" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_providers" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "deploys" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "flow_builder_flows" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "ideas" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "sprints" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active_tenant_id" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_platform_admin" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "workspaces" ADD COLUMN "tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tenants" ADD CONSTRAINT "user_tenants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_table_idx" ON "audit_logs" USING btree ("tenant_id","table");--> statement-breakpoint
CREATE INDEX "user_tenants_tenant_user_idx" ON "user_tenants" USING btree ("tenant_id","user_id");--> statement-breakpoint
CREATE INDEX "user_tenants_user_idx" ON "user_tenants" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "agenda_tenant_idx" ON "agenda_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_history_tenant_idx" ON "ai_history" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_memories_tenant_idx" ON "ai_memories" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ai_providers_tenant_idx" ON "ai_providers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "clients_tenant_idx" ON "clients" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "clients_tenant_status_idx" ON "clients" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "companies_tenant_idx" ON "companies" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "deploys_tenant_idx" ON "deploys" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "documents_tenant_idx" ON "documents" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "finance_tenant_idx" ON "finance_entries" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "finance_tenant_date_idx" ON "finance_entries" USING btree ("tenant_id","date");--> statement-breakpoint
CREATE INDEX "flows_tenant_idx" ON "flow_builder_flows" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ideas_tenant_idx" ON "ideas" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "milestones_tenant_idx" ON "milestones" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "notes_tenant_idx" ON "notes" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "notifications_tenant_idx" ON "notifications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "products_tenant_idx" ON "products" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "projects_tenant_idx" ON "projects" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "projects_tenant_status_idx" ON "projects" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "sprints_tenant_idx" ON "sprints" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tasks_tenant_idx" ON "tasks" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tasks_tenant_status_idx" ON "tasks" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "workspace_members_tenant_idx" ON "workspace_members" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "workspaces_tenant_idx" ON "workspaces" USING btree ("tenant_id");