import { db, table } from '$lib/server/db';
import { eq, sql } from 'drizzle-orm';
import { DrizzleError } from 'drizzle-orm/errors';
import type { PageServerLoad } from './$types';
import { error, fail } from '@sveltejs/kit';
import { modrinth } from '$lib/server/modrinth';
import { Octokit, RequestError } from 'octokit';
import { fromPromise } from 'neverthrow';
import { parseGitHubUrl } from '$lib';
import { decodeBase64, encodeBase64 } from '@oslojs/encoding';
import type { Project } from 'typerinth';
import { createModToml } from '$lib';
import { sha256 } from '@oslojs/crypto/sha2';
import toml from 'smol-toml';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	const modpackId = params.id;
	// const modpack = (await db.select().from(table.modpack).where(eq(table.modpack.id, modpackId))).at(
	// 	0
	// );
	// if (!modpack) error(404);

	// const modpack = await db.query.modpack.findFirst({
	// 	where: eq(table.modpack.id, modpackId),
	// 	with: {
	// 		creatorId: true
	// 	}
	// });

	const res = await fromPromise(
		db
			.select({
				modpack: table.modpack,
				creator: table.user
			})
			.from(table.modpack)
			.where(eq(table.modpack.id, modpackId))
			.leftJoin(table.user, eq(table.modpack.creatorId, table.user.id))
			.limit(1),
		(e) => e as DrizzleError
	).map((result) => result.at(0));

	if (res.isErr()) error(500, { message: 'DB error' });
	if (!res.value) error(404, { message: 'Modpack not found' });
	if (!res.value.creator) error(404, { message: 'Modpack creator not found' });

	const { modpack, creator } = res.value;

	const github = new Octokit({
		auth: creator.githubToken
	});

	const githubUrl = modpack.githubUrl;
	const urlres = parseGitHubUrl(githubUrl);
	if (urlres.isErr()) error(500, { message: 'Invalid GitHub URL' });
	const { owner, repo } = urlres.value;

	const packToml = await fromPromise(
		github.rest.repos.getContent({
			owner: owner,
			repo: repo,
			path: 'pack.toml'
		}),
		(e) => e as RequestError
	);

	if (packToml.isErr()) error(500, { message: 'Error fetching pack.toml' });

	const query = url.searchParams.get('query') ?? '';
	const searchResults = await modrinth.search(query);

	if (packToml.value.status !== 200) {
		error(500, { message: 'Error fetching pack.toml' });
	}

	if (Array.isArray(packToml.value.data)) {
		error(500, { message: 'Error fetching pack.toml' });
	}

	if (packToml.value.data.type !== 'file') {
		error(500, { message: 'Error fetching pack.toml' });
	}

	const contents = packToml.value.data.content;

	return { modpack, searchResults, packToml: contents };
};

export const actions = {
	addMod: async ({ cookies, locals, params, request }) => {
		const { user } = locals;
		if (!user) {
			return fail(400, { message: 'You must be logged in to add a mod' });
		}

		const formData = await request.formData();
		const modSlug = formData.get('modSlug')?.toString();

		if (!modSlug) return fail(400, { message: 'You must provide a mod name' });

		const modpackId = params.id;
		const modpackRes = await fromPromise(
			db.select().from(table.modpack).where(eq(table.modpack.id, modpackId)),
			() => null
		);
		if (modpackRes.isErr()) return fail(400, { message: 'Error fetching modpack' });
		const modpack = modpackRes.value[0];

		const res = await fromPromise(modrinth.getProject(modSlug), () => null);
		if (res.isErr()) return fail(400, { message: 'Error fetching mod' });
		const mod: Project = res.value;

		// Get latest version for modpack's loader & version
		const versionsRes = await fromPromise(
			modrinth.getProjectVersions(mod.id, {
				loaders: [modpack.loaderId],
				game_versions: [modpack.mcVersion]
			}),
			() => null
		);
		if (versionsRes.isErr()) return fail(400, { message: 'Error fetching mod versions' });
		const versions = versionsRes.value;

		const latestVersion = versions[0];

		// Get mod's dependencies
		const dependencies = latestVersion.dependencies;

		console.log(dependencies);

		const dependenciesProjectIds = [];
		const dependenciesVersionIds = [];

		for (const dependency of dependencies) {
			if (dependency.dependency_type === 'required') {
				if (dependency.version_id !== null) {
					dependenciesVersionIds.push(dependency.version_id);
				} else if (dependency.project_id !== null) {
					dependenciesProjectIds.push(dependency.project_id);
				}
			}
		}

		// TODO: Recursively fetch dependencies

		// TODO: Make mod files for dependencies

		// Make mod file for installed mod
		const octokit = new Octokit({
			auth: user.githubToken
		});

		const githubUrl = modpack.githubUrl;
		const urlres = parseGitHubUrl(githubUrl);
		if (urlres.isErr()) error(500, { message: 'Invalid GitHub URL' });
		const { owner, repo } = urlres.value;

		const modFileContent = createModToml(mod, latestVersion);
		const modFileHash = sha256(new TextEncoder().encode(modFileContent));

		const createFileResp = await fromPromise(
			octokit.rest.repos.createOrUpdateFileContents({
				owner: owner,
				repo: repo,
				path: `mods/${mod.slug}.toml`,
				message: `Add "${mod.title}" to modpack`,
				branch: 'main',
				committer: {
					name: 'ModBox',
					email: 'modbox@modbox.com'
				},
				content: encodeBase64(new TextEncoder().encode(modFileContent))
			}),
			(e) => e as RequestError
		);

		const indexFileContentRes = await fromPromise(
			octokit.rest.repos.getContent({
				owner,
				repo,
				path: 'index.toml',
				ref: 'heads/main'
			}),
			(e) => e as RequestError
		);
		let indexFileContent = 'hash-format = "sha256"';
		if (
			indexFileContentRes.isErr() ||
			indexFileContentRes.value.status !== 200 ||
			Array.isArray(indexFileContentRes.value.data) ||
			indexFileContentRes.value.data.type !== 'file'
		) {
			error(500, { message: 'Error fetching index.toml (wrong type)' });
		} else {
			indexFileContent = indexFileContentRes.value.data.content;
		}
		indexFileContent = `${indexFileContent}

[[files]]
file = "modes/${mod.slug}.toml"
hash = "${modFileHash}"
metafile = true`;

		const packTomlContentRes = await fromPromise(
			octokit.rest.repos.getContent({
				owner,
				repo,
				path: 'pack.toml',
				ref: 'heads/main'
			}),
			(e) => e as RequestError
		);
		if (packTomlContentRes.isErr()) error(500, { message: 'Error fetching pack.toml' });
		if (
			packTomlContentRes.value.status !== 200 ||
			Array.isArray(packTomlContentRes.value.data) ||
			packTomlContentRes.value.data.type !== 'file'
		) {
			error(500, { message: 'Error fetching pack.toml' });
		}
		console.log(packTomlContentRes.value.data.content);
		let packTomlContent = new TextDecoder().decode(
			decodeBase64(packTomlContentRes.value.data.content.replaceAll('\n', ''))
		);

		console.log(packTomlContent);

		const indexHash = encodeBase64(sha256(new TextEncoder().encode(indexFileContent)));

		const packToml = toml.parse(packTomlContent);
		packToml.index = { hash: indexHash };
		packTomlContent = toml.stringify(packToml);

		console.log(packTomlContent);

		const packTomlUpdateRes = await fromPromise(
			octokit.rest.repos.createOrUpdateFileContents({
				owner: owner,
				repo: repo,
				path: 'pack.toml',
				message: 'Update add mod',
				branch: 'main',
				sha: packTomlContentRes.value.data.sha,
				committer: {
					name: 'ModBox',
					email: 'modbox@modbox.com'
				},
				content: encodeBase64(new TextEncoder().encode(packTomlContent))
			}),
			(e) => e as RequestError
		);
		if (packTomlUpdateRes.isErr()) error(500, packTomlUpdateRes.error);

		const indexUpdateRes = await fromPromise(
			octokit.rest.repos.createOrUpdateFileContents({
				owner: owner,
				repo: repo,
				path: 'index.toml',
				message: 'Update add mod',
				branch: 'main',
				sha: indexFileContentRes.value.data.sha,
				committer: {
					name: 'ModBox',
					email: 'modbox@modbox.com'
				},
				content: encodeBase64(new TextEncoder().encode(indexFileContent))
			}),
			(e) => e as RequestError
		);

		return { success: true };
	},
	removeMod: async ({ cookies, locals, params, request }) => {
		return { success: true };
	},
	deleteModpack: async ({ cookies, locals, params, request }) => {
		const { user } = locals;
		if (!user) {
			return fail(400, { message: 'You must be logged in to delete a modpack' });
		}

		const formData = await request.formData();
		const modpackId = params.id;

		await db.delete(table.modpack).where(eq(table.modpack.id, modpackId));

		return { success: true };
	}
};
