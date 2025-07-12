import { desc, relations } from 'drizzle-orm';
import {
	pgTable,
	serial,
	integer,
	text,
	timestamp,
	numeric,
	date,
	boolean,
	pgEnum,
	uuid
} from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: uuid('id').defaultRandom().primaryKey(),
	username: text('username').notNull().unique(),
	githubId: integer('github_id').notNull(),
	githubToken: text('github_token').notNull(),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(), // ID is generated from the token
	userId: uuid('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const modpack = pgTable('modpack', {
	id: uuid('id').defaultRandom().primaryKey(),
	slug: text('slug').notNull(),

	creatorId: uuid('creator_id')
		.notNull()
		.references(() => user.id),
	name: text('name').notNull(),
	description: text('description').notNull(),

	isPublic: boolean('is_public').notNull(),
	loaderId: text('loader_id')
		.references(() => modLoader.id)
		.notNull(),
	mcVersion: text('mc_version')
		.references(() => mcVersion.version)
		.notNull(),

	githubUrl: text('github_url').notNull(),

	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const releaseTypeEnum = pgEnum('release_type', ['release', 'snapshot']);

export const mcVersion = pgTable('mc_version', {
	version: text('version').primaryKey(), // '1.20.1', etc.
	releaseDate: date('release_date').notNull(),
	releaseType: releaseTypeEnum('release_type').notNull(),
	isMajor: boolean('is_major').notNull() // ex 1.19, 1.20, 1.21
});

export const modLoader = pgTable('mod_loader', {
	id: text('id').primaryKey(), // 'fabric', 'forge', etc.
	displayName: text('display_name').notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Modpack = typeof modpack.$inferSelect;
