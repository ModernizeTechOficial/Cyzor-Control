CREATE TABLE "agenda_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '',
	"date" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"owner" text NOT NULL,
	"participants" jsonb DEFAULT '[]'::jsonb,
	"location" text DEFAULT '',
	"type" text DEFAULT 'compromisso',
	"category" text DEFAULT 'Administrativo',
	"status" text DEFAULT 'Agendado',
	"reminder" text DEFAULT 'none',
	"recurrence" text DEFAULT 'none',
	"recurrence_description" text DEFAULT '',
	"linked_project_id" integer,
	"linked_company_id" integer,
	"linked_task_id" integer,
	"comments" jsonb DEFAULT '[]'::jsonb,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"checklist" jsonb DEFAULT '[]'::jsonb,
	"history" jsonb DEFAULT '[]'::jsonb,
	"reserved_resources" jsonb DEFAULT '[]'::jsonb,
	"is_time_block" boolean DEFAULT false,
	"time_block_type" text DEFAULT 'none',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"user_uid" text NOT NULL,
	"prompt" text NOT NULL,
	"response" text NOT NULL,
	"context_type" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_memories" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"importance" integer DEFAULT 5,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ai_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"enabled" boolean DEFAULT true,
	"api_key" text NOT NULL,
	"base_url" text,
	"default_model" text,
	"priority" integer DEFAULT 0,
	"timeout" integer DEFAULT 30000,
	"retry_attempts" integer DEFAULT 3,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"company_id" integer,
	"status" text DEFAULT 'Ativo',
	"notes" text,
	"role" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"name" text NOT NULL,
	"cnpj" text,
	"industry" text,
	"size" text,
	"website" text,
	"status" text DEFAULT 'Ativo',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deploys" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"version" text NOT NULL,
	"status" text DEFAULT 'success',
	"user_uid" text,
	"duration" text,
	"logs" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"folder" text,
	"type" text DEFAULT 'FILE',
	"url" text,
	"size" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"author_uid" text,
	"project_id" integer,
	"is_favorite" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "finance_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"description" text NOT NULL,
	"category" text,
	"date" timestamp NOT NULL,
	"status" text DEFAULT 'PENDENTE',
	"company_id" integer,
	"project_id" integer,
	"is_recurrent" boolean DEFAULT false,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flow_builder_flows" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"user_uid" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'flow' NOT NULL,
	"flow_json" jsonb DEFAULT '{"nodes":[],"edges":[]}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'Nova',
	"priority" text DEFAULT 'Média',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"author_uid" text,
	"converted_to_project_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"date" timestamp,
	"status" text DEFAULT 'PENDENTE',
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"color" text DEFAULT 'bg-white',
	"is_pinned" boolean DEFAULT false,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"author_uid" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text DEFAULT 'info',
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"company_id" integer,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'Em Desenvolvimento',
	"launch_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"company_id" integer,
	"product_id" integer,
	"name" text NOT NULL,
	"description" text,
	"owner" text DEFAULT 'Sem dono',
	"status" text DEFAULT 'Em Andamento',
	"priority" text DEFAULT 'Média',
	"progress" integer DEFAULT 0,
	"budget" numeric(12, 2) DEFAULT '0',
	"start_date" timestamp,
	"due_date" timestamp,
	"team" jsonb DEFAULT '[]'::jsonb,
	"history" jsonb DEFAULT '[]'::jsonb,
	"comments" jsonb DEFAULT '[]'::jsonb,
	"criteria" jsonb DEFAULT '[]'::jsonb,
	"velocity" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sprints" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" text NOT NULL,
	"goal" text,
	"start_date" timestamp,
	"end_date" timestamp,
	"status" text DEFAULT 'PLANNED',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"sprint_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'BACKLOG',
	"priority" text DEFAULT 'Média',
	"assignee_uid" text,
	"due_date" timestamp,
	"order" integer DEFAULT 0,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"subtasks" jsonb DEFAULT '[]'::jsonb,
	"task_comments" jsonb DEFAULT '[]'::jsonb,
	"dependencies" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"display_name" text,
	"photo_url" text,
	"current_plan" text DEFAULT 'Pro',
	"active_workspace_id" integer,
	"phone" text,
	"role" text,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"user_uid" text NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"cargo" text DEFAULT 'Colaborador',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_uid" text NOT NULL,
	"plan" text DEFAULT 'Pro',
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agenda_events" ADD CONSTRAINT "agenda_events_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_events" ADD CONSTRAINT "agenda_events_linked_project_id_projects_id_fk" FOREIGN KEY ("linked_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_events" ADD CONSTRAINT "agenda_events_linked_company_id_companies_id_fk" FOREIGN KEY ("linked_company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda_events" ADD CONSTRAINT "agenda_events_linked_task_id_tasks_id_fk" FOREIGN KEY ("linked_task_id") REFERENCES "public"."tasks"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_history" ADD CONSTRAINT "ai_history_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_history" ADD CONSTRAINT "ai_history_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_memories" ADD CONSTRAINT "ai_memories_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_providers" ADD CONSTRAINT "ai_providers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deploys" ADD CONSTRAINT "deploys_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deploys" ADD CONSTRAINT "deploys_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deploys" ADD CONSTRAINT "deploys_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_author_uid_users_uid_fk" FOREIGN KEY ("author_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_entries" ADD CONSTRAINT "finance_entries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flow_builder_flows" ADD CONSTRAINT "flow_builder_flows_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flow_builder_flows" ADD CONSTRAINT "flow_builder_flows_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_author_uid_users_uid_fk" FOREIGN KEY ("author_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideas" ADD CONSTRAINT "ideas_converted_to_project_id_projects_id_fk" FOREIGN KEY ("converted_to_project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_author_uid_users_uid_fk" FOREIGN KEY ("author_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_sprint_id_sprints_id_fk" FOREIGN KEY ("sprint_id") REFERENCES "public"."sprints"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_uid_users_uid_fk" FOREIGN KEY ("assignee_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_uid_users_uid_fk" FOREIGN KEY ("user_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_uid_users_uid_fk" FOREIGN KEY ("owner_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agenda_ws_idx" ON "agenda_events" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "agenda_date_idx" ON "agenda_events" USING btree ("date");--> statement-breakpoint
CREATE INDEX "ai_history_ws_idx" ON "ai_history" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "ai_memories_ws_idx" ON "ai_memories" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "ai_providers_ws_idx" ON "ai_providers" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "clients_ws_idx" ON "clients" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "companies_ws_idx" ON "companies" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "deploys_ws_idx" ON "deploys" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "deploys_prod_idx" ON "deploys" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "documents_ws_idx" ON "documents" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "finance_ws_idx" ON "finance_entries" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "finance_date_idx" ON "finance_entries" USING btree ("date");--> statement-breakpoint
CREATE INDEX "flows_ws_idx" ON "flow_builder_flows" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "ideas_ws_idx" ON "ideas" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "notes_ws_idx" ON "notes" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "notifications_ws_idx" ON "notifications" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "products_ws_idx" ON "products" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "products_comp_idx" ON "products" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "projects_ws_idx" ON "projects" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "sprints_proj_idx" ON "sprints" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_proj_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_sprint_idx" ON "tasks" USING btree ("sprint_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_uid_idx" ON "users" USING btree ("uid");--> statement-breakpoint
CREATE INDEX "ws_members_ws_user_idx" ON "workspace_members" USING btree ("workspace_id","user_uid");--> statement-breakpoint
CREATE INDEX "ws_members_user_idx" ON "workspace_members" USING btree ("user_uid");--> statement-breakpoint
CREATE INDEX "workspaces_owner_idx" ON "workspaces" USING btree ("owner_uid");