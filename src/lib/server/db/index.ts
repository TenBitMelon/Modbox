import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import { encodeBase32LowerCase } from '@oslojs/encoding';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });
export const table = schema;

export async function seed() {
	// Insert mod loaders
	await db.insert(table.modLoader).values([
		{ id: 'fabric', displayName: 'Fabric' },
		{ id: 'forge', displayName: 'Forge' },
		{ id: 'neoforge', displayName: 'NeoForge' }
	]);

	// Insert Minecraft versions
	await db.insert(table.mcVersion).values([
		{
			version: '1.21',
			releaseDate: '2024-06-13',
			releaseType: 'release',
			isMajor: true
		},
		{
			version: '1.20.6',
			releaseDate: '2024-04-23',
			releaseType: 'release',
			isMajor: false
		},
		{
			version: '1.20.1',
			releaseDate: '2023-06-07',
			releaseType: 'release',
			isMajor: false
		},
		{
			version: '1.21-snapshot',
			releaseDate: '2024-05-01',
			releaseType: 'snapshot',
			isMajor: false
		},
		{
			version: '1.19',
			releaseDate: '2022-06-07',
			releaseType: 'release',
			isMajor: true
		}
	]);

	console.log('✅ Seed complete.');
}
