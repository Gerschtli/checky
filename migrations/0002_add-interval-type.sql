ALTER TABLE `tasks` RENAME COLUMN "interval_days" TO "interval_count";--> statement-breakpoint
ALTER TABLE `tasks` ADD `interval_type` text DEFAULT 'days' NOT NULL;