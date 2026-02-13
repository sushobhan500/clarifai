CREATE TABLE `lab_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`file_name` varchar(255) NOT NULL,
	`file_url` text NOT NULL,
	`file_key` varchar(255) NOT NULL,
	`extracted_text` text,
	`report_date` timestamp,
	`testing_facility` varchar(255),
	`status` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`error_message` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lab_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lab_values` (
	`id` int AUTO_INCREMENT NOT NULL,
	`report_id` int NOT NULL,
	`test_name` varchar(255) NOT NULL,
	`test_abbreviation` varchar(50),
	`value` decimal(10,4) NOT NULL,
	`unit` varchar(50),
	`reference_range_low` decimal(10,4),
	`reference_range_high` decimal(10,4),
	`status` enum('normal','borderline_low','borderline_high','low','high','very_low','very_high') NOT NULL,
	`severity` enum('none','low','medium','high') NOT NULL,
	`interpretation` text,
	`recommendation` text,
	`color` varchar(7),
	`emoji` varchar(10),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lab_values_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medical_glossary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`term` varchar(255) NOT NULL,
	`abbreviation` varchar(50),
	`definition` text NOT NULL,
	`plain_english` text,
	`category` varchar(100),
	`related_terms` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `medical_glossary_id` PRIMARY KEY(`id`),
	CONSTRAINT `medical_glossary_term_unique` UNIQUE(`term`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`email_on_critical_values` boolean DEFAULT true,
	`email_on_analysis_complete` boolean DEFAULT true,
	`email_on_abnormal_results` boolean DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`report_id` int,
	`type` enum('critical_value','analysis_complete','abnormal_result') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`email_sent` boolean DEFAULT false,
	`sent_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reference_ranges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`test_name` varchar(255) NOT NULL,
	`test_abbreviation` varchar(50) NOT NULL,
	`category` varchar(100),
	`unit` varchar(50),
	`range_low_male` decimal(10,4),
	`range_high_male` decimal(10,4),
	`range_low_female` decimal(10,4),
	`range_high_female` decimal(10,4),
	`range_low_child` decimal(10,4),
	`range_high_child` decimal(10,4),
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reference_ranges_id` PRIMARY KEY(`id`),
	CONSTRAINT `reference_ranges_test_abbreviation_unique` UNIQUE(`test_abbreviation`)
);
