CREATE TABLE "billing_customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"environment" text DEFAULT 'sandbox',
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "billing_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"stripe_invoice_id" text,
	"stripe_payment_intent_id" text,
	"environment" text DEFAULT 'sandbox',
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'BRL',
	"status" text NOT NULL,
	"payment_method" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "billing_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_id" integer NOT NULL,
	"stripe_subscription_id" text NOT NULL,
	"environment" text DEFAULT 'sandbox',
	"status" text NOT NULL,
	"current_period_start" timestamp,
	"current_period_end" timestamp,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "billing_subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "billing_webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"stripe_event_id" text NOT NULL,
	"environment" text DEFAULT 'sandbox',
	"type" text NOT NULL,
	"status" text DEFAULT 'processed',
	"payload" jsonb NOT NULL,
	"error" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "billing_webhook_events_stripe_event_id_unique" UNIQUE("stripe_event_id")
);
--> statement-breakpoint
CREATE TABLE "entity_approvals" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"title" text NOT NULL,
	"requester_uid" text NOT NULL,
	"requester_name" text NOT NULL,
	"status" text DEFAULT 'PENDING',
	"approvers" jsonb DEFAULT '[]',
	"history" jsonb DEFAULT '[]',
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entity_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer NOT NULL,
	"user_id" text,
	"author_name" text NOT NULL,
	"author_avatar" text,
	"content" text NOT NULL,
	"parent_id" integer,
	"reactions" jsonb DEFAULT '[]',
	"attachments" jsonb DEFAULT '[]',
	"is_edited" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entity_relationships" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"source_type" text NOT NULL,
	"source_id" integer NOT NULL,
	"target_type" text NOT NULL,
	"target_id" integer NOT NULL,
	"relationship_type" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entity_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"structure_json" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "missions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"checklist" jsonb NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" numeric DEFAULT '0.00',
	"currency" text DEFAULT 'BRL',
	"billing_period" text DEFAULT 'monthly',
	"max_users" integer DEFAULT 1,
	"max_workspaces" integer DEFAULT 1,
	"features" jsonb DEFAULT '[]'::jsonb,
	"is_popular" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"stripe_product_id" text,
	"stripe_price_id" text,
	"test_stripe_product_id" text,
	"test_stripe_price_id" text,
	"live_stripe_product_id" text,
	"live_stripe_price_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "plans_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "platform_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "platform_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "product_licenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"company_id" integer,
	"license_key" text NOT NULL,
	"status" text DEFAULT 'Ativa',
	"type" text DEFAULT 'Comercial',
	"starts_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_licenses_license_key_unique" UNIQUE("license_key")
);
--> statement-breakpoint
CREATE TABLE "roadmaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"product_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'PLANNING',
	"priority" text DEFAULT 'MEDIUM',
	"progress" integer DEFAULT 0,
	"responsible_uid" text,
	"dependencies" jsonb DEFAULT '[]',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stripe_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"publishable_key" text,
	"secret_key" text,
	"webhook_secret" text,
	"test_publishable_key" text,
	"test_secret_key" text,
	"test_webhook_secret" text,
	"live_publishable_key" text,
	"live_secret_key" text,
	"live_webhook_secret" text,
	"environment" text DEFAULT 'sandbox',
	"global_logo_url" text,
	"global_icon_url" text,
	"login_hero_url" text,
	"global_logo_size" text DEFAULT '40',
	"global_icon_size" text DEFAULT '20',
	"global_app_name" text DEFAULT 'CYZOR',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeline_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" integer,
	"entity_name" text,
	"action" text NOT NULL,
	"user_name" text NOT NULL,
	"user_avatar" text,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workspace_bes_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"action_type" text NOT NULL,
	"entity_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "workspace_invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" integer NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'MEMBER' NOT NULL,
	"inviter_uid" text NOT NULL,
	"status" text DEFAULT 'PENDING',
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "workspace_invitations_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "workspace_mission_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" integer NOT NULL,
	"mission_id" integer NOT NULL,
	"status" text DEFAULT 'TODO',
	"current_checklist_progress" jsonb DEFAULT '{}',
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "current_plan" SET DEFAULT 'free';--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "workspace_id" integer;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "cover_url" text;--> statement-breakpoint
ALTER TABLE "ideas" ADD COLUMN "analysis" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "milestones" ADD COLUMN "workspace_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "type" text DEFAULT 'SaaS';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "target_audience" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "pricing_model" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "features" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "cover_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "cover_url" text;--> statement-breakpoint
ALTER TABLE "sprints" ADD COLUMN "workspace_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "workspace_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tour_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "trial_ends_at" timestamp;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD COLUMN "status" text DEFAULT 'Ativo';--> statement-breakpoint
ALTER TABLE "billing_customers" ADD CONSTRAINT "billing_customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_customers" ADD CONSTRAINT "billing_customers_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_payments" ADD CONSTRAINT "billing_payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_approvals" ADD CONSTRAINT "entity_approvals_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_approvals" ADD CONSTRAINT "entity_approvals_requester_uid_users_uid_fk" FOREIGN KEY ("requester_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_comments" ADD CONSTRAINT "entity_comments_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_comments" ADD CONSTRAINT "entity_comments_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_relationships" ADD CONSTRAINT "entity_relationships_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entity_templates" ADD CONSTRAINT "entity_templates_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_licenses" ADD CONSTRAINT "product_licenses_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_licenses" ADD CONSTRAINT "product_licenses_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_licenses" ADD CONSTRAINT "product_licenses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_responsible_uid_users_uid_fk" FOREIGN KEY ("responsible_uid") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_activities" ADD CONSTRAINT "timeline_activities_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_bes_actions" ADD CONSTRAINT "workspace_bes_actions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_invitations" ADD CONSTRAINT "workspace_invitations_inviter_uid_users_uid_fk" FOREIGN KEY ("inviter_uid") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_mission_progress" ADD CONSTRAINT "workspace_mission_progress_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_mission_progress" ADD CONSTRAINT "workspace_mission_progress_mission_id_missions_id_fk" FOREIGN KEY ("mission_id") REFERENCES "public"."missions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "billing_customers_tenant_idx" ON "billing_customers" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "billing_customers_user_idx" ON "billing_customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "billing_customers_env_idx" ON "billing_customers" USING btree ("stripe_customer_id","environment");--> statement-breakpoint
CREATE INDEX "billing_payments_tenant_idx" ON "billing_payments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "billing_subs_tenant_idx" ON "billing_subscriptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "approval_entity_idx" ON "entity_approvals" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "approval_ws_idx" ON "entity_approvals" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "approval_tenant_idx" ON "entity_approvals" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "comment_entity_idx" ON "entity_comments" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "comment_ws_idx" ON "entity_comments" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "comment_tenant_idx" ON "entity_comments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "rel_source_idx" ON "entity_relationships" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "rel_target_idx" ON "entity_relationships" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "rel_ws_idx" ON "entity_relationships" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "rel_tenant_idx" ON "entity_relationships" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "template_ws_idx" ON "entity_templates" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "template_tenant_idx" ON "entity_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "prod_licenses_ws_idx" ON "product_licenses" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "prod_licenses_prod_idx" ON "product_licenses" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "prod_licenses_tenant_idx" ON "product_licenses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "roadmap_ws_idx" ON "roadmaps" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "roadmap_tenant_idx" ON "roadmaps" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "timeline_ws_idx" ON "timeline_activities" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "timeline_tenant_idx" ON "timeline_activities" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "timeline_entity_idx" ON "timeline_activities" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "ws_bes_action_idx" ON "workspace_bes_actions" USING btree ("workspace_id","action_type","entity_id");--> statement-breakpoint
CREATE INDEX "ws_inv_ws_email_idx" ON "workspace_invitations" USING btree ("workspace_id","email");--> statement-breakpoint
CREATE INDEX "ws_inv_token_idx" ON "workspace_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "ws_inv_tenant_idx" ON "workspace_invitations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ws_mission_idx" ON "workspace_mission_progress" USING btree ("workspace_id","mission_id");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sprints" ADD CONSTRAINT "sprints_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_ws_idx" ON "audit_logs" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "milestones_ws_idx" ON "milestones" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "sprints_ws_idx" ON "sprints" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "tasks_ws_idx" ON "tasks" USING btree ("workspace_id");