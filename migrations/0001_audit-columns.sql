ALTER TABLE `sessions` ADD `created_at` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks_completed` ADD `created_at` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks_completed` ADD `updated_at` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `created_at` integer DEFAULT (unixepoch()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updated_at` integer NOT NULL;