CREATE TABLE `agenda_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '',
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`owner` text NOT NULL,
	`participants` text DEFAULT '[]',
	`location` text DEFAULT '',
	`type` text DEFAULT 'compromisso',
	`category` text DEFAULT 'Administrativo',
	`status` text DEFAULT 'Agendado',
	`reminder` text DEFAULT 'none',
	`recurrence` text DEFAULT 'none',
	`recurrence_description` text DEFAULT '',
	`linked_project_id` integer,
	`linked_company_id` integer,
	`linked_task_id` integer,
	`comments` text DEFAULT '[]',
	`attachments` text DEFAULT '[]',
	`checklist` text DEFAULT '[]',
	`history` text DEFAULT '[]',
	`reserved_resources` text DEFAULT '[]',
	`is_time_block` integer DEFAULT false,
	`time_block_type` text DEFAULT 'none',
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`linked_project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`linked_company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`linked_task_id`) REFERENCES `tasks`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `ai_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`user_uid` text NOT NULL,
	`prompt` text NOT NULL,
	`response` text NOT NULL,
	`context_type` text,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_uid`) REFERENCES `users`(`uid`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_memories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`category` text NOT NULL,
	`content` text NOT NULL,
	`importance` integer DEFAULT 5,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `companies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`name` text NOT NULL,
	`cnpj` text,
	`industry` text,
	`size` text,
	`website` text,
	`status` text DEFAULT 'Ativo',
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`folder` text,
	`type` text DEFAULT 'FILE',
	`url` text,
	`size` text,
	`tags` text DEFAULT '[]',
	`author_uid` text,
	`project_id` integer,
	`is_favorite` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_uid`) REFERENCES `users`(`uid`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `finance_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`description` text NOT NULL,
	`category` text,
	`date` integer NOT NULL,
	`status` text DEFAULT 'PENDENTE',
	`company_id` integer,
	`project_id` integer,
	`is_recurrent` integer DEFAULT false,
	`due_date` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `flow_builder_flows` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`user_uid` text NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'flow' NOT NULL,
	`flow_json` text DEFAULT '{"nodes":[],"edges":[]}' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_uid`) REFERENCES `users`(`uid`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'Nova',
	`priority` text DEFAULT 'Média',
	`tags` text DEFAULT '[]',
	`author_uid` text,
	`converted_to_project_id` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_uid`) REFERENCES `users`(`uid`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`converted_to_project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `milestones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`date` integer,
	`status` text DEFAULT 'PENDENTE',
	`description` text,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`title` text NOT NULL,
	`content` text,
	`color` text DEFAULT 'bg-white',
	`is_pinned` integer DEFAULT false,
	`tags` text DEFAULT '[]',
	`author_uid` text,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`author_uid`) REFERENCES `users`(`uid`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`type` text DEFAULT 'info',
	`is_read` integer DEFAULT false,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`company_id` integer,
	`name` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'Em Desenvolvimento',
	`launch_date` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`company_id` integer,
	`product_id` integer,
	`name` text NOT NULL,
	`description` text,
	`owner` text DEFAULT 'Sem dono',
	`status` text DEFAULT 'Em Andamento',
	`priority` text DEFAULT 'Média',
	`progress` integer DEFAULT 0,
	`budget` real DEFAULT '0',
	`start_date` integer,
	`due_date` integer,
	`team` text DEFAULT '[]',
	`history` text DEFAULT '[]',
	`comments` text DEFAULT '[]',
	`criteria` text DEFAULT '[]',
	`velocity` text DEFAULT '[]',
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `sprints` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`name` text NOT NULL,
	`goal` text,
	`start_date` integer,
	`end_date` integer,
	`status` text DEFAULT 'PLANNED',
	`created_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`sprint_id` integer,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'BACKLOG',
	`priority` text DEFAULT 'Média',
	`assignee_uid` text,
	`due_date` integer,
	`order` integer DEFAULT 0,
	`tags` text DEFAULT '[]',
	`subtasks` text DEFAULT '[]',
	`task_comments` text DEFAULT '[]',
	`dependencies` text DEFAULT '[]',
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sprint_id`) REFERENCES `sprints`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`assignee_uid`) REFERENCES `users`(`uid`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`uid` text NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`photo_url` text,
	`current_plan` text DEFAULT 'Pro',
	`active_workspace_id` integer,
	`phone` text,
	`role` text,
	`settings` text DEFAULT '{}',
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_uid_unique` ON `users` (`uid`);--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`user_uid` text NOT NULL,
	`role` text DEFAULT 'MEMBER' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_uid`) REFERENCES `users`(`uid`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`owner_uid` text NOT NULL,
	`plan` text DEFAULT 'Pro',
	`settings` text DEFAULT '{}',
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`owner_uid`) REFERENCES `users`(`uid`) ON UPDATE no action ON DELETE cascade
);
