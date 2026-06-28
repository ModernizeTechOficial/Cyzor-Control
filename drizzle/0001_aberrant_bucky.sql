PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_projects` (
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
	`budget` real DEFAULT 0,
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
INSERT INTO `__new_projects`("id", "workspace_id", "company_id", "product_id", "name", "description", "owner", "status", "priority", "progress", "budget", "start_date", "due_date", "team", "history", "comments", "criteria", "velocity", "created_at", "updated_at") SELECT "id", "workspace_id", "company_id", "product_id", "name", "description", "owner", "status", "priority", "progress", "budget", "start_date", "due_date", "team", "history", "comments", "criteria", "velocity", "created_at", "updated_at" FROM `projects`;--> statement-breakpoint
DROP TABLE `projects`;--> statement-breakpoint
ALTER TABLE `__new_projects` RENAME TO `projects`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `projects_ws_idx` ON `projects` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `agenda_ws_idx` ON `agenda_events` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `agenda_date_idx` ON `agenda_events` (`date`);--> statement-breakpoint
CREATE INDEX `ai_history_ws_idx` ON `ai_history` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `ai_memories_ws_idx` ON `ai_memories` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `companies_ws_idx` ON `companies` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `documents_ws_idx` ON `documents` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `finance_ws_idx` ON `finance_entries` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `finance_date_idx` ON `finance_entries` (`date`);--> statement-breakpoint
CREATE INDEX `flows_ws_idx` ON `flow_builder_flows` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `ideas_ws_idx` ON `ideas` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `notes_ws_idx` ON `notes` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `notifications_ws_idx` ON `notifications` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `products_ws_idx` ON `products` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `products_comp_idx` ON `products` (`company_id`);--> statement-breakpoint
CREATE INDEX `sprints_proj_idx` ON `sprints` (`project_id`);--> statement-breakpoint
CREATE INDEX `tasks_proj_idx` ON `tasks` (`project_id`);--> statement-breakpoint
CREATE INDEX `tasks_sprint_idx` ON `tasks` (`sprint_id`);--> statement-breakpoint
CREATE INDEX `users_email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_uid_idx` ON `users` (`uid`);--> statement-breakpoint
CREATE INDEX `ws_members_ws_user_idx` ON `workspace_members` (`workspace_id`,`user_uid`);--> statement-breakpoint
CREATE INDEX `ws_members_user_idx` ON `workspace_members` (`user_uid`);--> statement-breakpoint
CREATE INDEX `workspaces_owner_idx` ON `workspaces` (`owner_uid`);