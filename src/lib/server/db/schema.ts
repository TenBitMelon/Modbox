import { relations } from 'drizzle-orm';
import { pgTable, serial, integer, text, timestamp, numeric } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	githubId: integer('github_id').notNull(),
	githubToken: text('github_token').notNull()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const modpack = pgTable('modpack', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	creatorId: text('creator')
		.notNull()
		.references(() => user.id),
	mods: text('mods').notNull().array().notNull()
});

export const modpackRelations = relations(modpack, ({ one }) => ({
	author: one(user, {
		fields: [modpack.creatorId],
		references: [user.id]
	})
}));

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;

export type Modpack = typeof modpack.$inferSelect;
