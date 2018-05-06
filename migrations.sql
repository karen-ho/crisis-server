CREATE DATABASE `crisis`;

CREATE TABLE `person` (
	`id` int(10) unsigned NOT NULL AUTO_INCREMENT,
	`name` varchar(40) DEFAULT NULL,
	`role` varchar(20) DEFAULT NULL,
	`phone` varchar(20) DEFAULT NULL,
	`lat` varchar(20) DEFAULT NULL,
	`long` varchar(20) DEFAULT NULL,
	`created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	`weight` varchar(20) DEFAULT NULL,
	`height` varchar(20) DEFAULT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `care` (
	`id` int(20) unsigned NOT NULL AUTO_INCREMENT,
	`patient_id` int(10) NOT NULL,
	`family_member_id` int(10) DEFAULT NULL,
	`driver_id` int(10) DEFAULT NULL,
	`family_done` tinyint(1) DEFAULT 0,
	`driver_done` tinyint(1) DEFAULT 0,
	`destination_lat` varchar(20),
	`destination_long` varchar(20),
	`created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`id`),
	KEY (`driver_id`),
	KEY (`family_member_id`)
);

CREATE TABLE `family_relations` (
	`family_member_id` int(10) unsigned NOT NULL,
	`patient_id` int(10) unsigned NOT NULL,
	`created_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`patient_id`)
);

CREATE TABLE `data` (
	`person_id` int(10) unsigned NOT NULL,
	`heart_rate` int(10) unsigned NOT NULL,
	`lat` varchar(20) NOT NULL,
	`long` varchar(20) NOT NULL,
	`client_created_time` timestamp NOT NULL,
	KEY (`person_id`)
);