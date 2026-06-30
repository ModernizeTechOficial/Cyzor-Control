CREATE TABLE `ai_providers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`name` text NOT NULL,
	`enabled` integer DEFAULT true,
	`api_key` text NOT NULL,
	`base_url` text,
	`default_model` text,
	`priority` integer DEFAULT 0,
	`timeout` integer DEFAULT 30000,
	`retry_attempts` integer DEFAULT 3,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	`updated_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ai_providers_ws_idx` ON `ai_providers` (`workspace_id`);--> statement-breakpoint
CREATE TABLE `deploys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workspace_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`version` text NOT NULL,
	`status` text DEFAULT 'success',
	`user_uid` text,
	`duration` text,
	`logs` text,
	`created_at` integer DEFAULT (unixepoch() * 1000),
	FOREIGN KEY (`workspace_id`) REFERENCES `workspaces`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_uid`) REFERENCES `users`(`uid`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `deploys_ws_idx` ON `deploys` (`workspace_id`);--> statement-breakpoint
CREATE INDEX `deploys_prod_idx` ON `deploys` (`product_id`);