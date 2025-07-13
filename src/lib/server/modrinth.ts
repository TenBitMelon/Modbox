import { Modrinth } from 'typerinth';

export const modrinth = new Modrinth();

import { fromPromise } from 'neverthrow';
import type { Project, ProjectVersion } from 'typerinth';

export interface ModWithVersion {
	project: Project;
	version: ProjectVersion;
}

export interface ModDependency extends ModWithVersion {
	dependencies: ModDependency[];
}

export class ModrinthService {
	async getProjectWithVersion(
		modSlug: string,
		loaderId: string,
		mcVersion: string,
	): Promise<ModWithVersion> {
		const projectRes = await fromPromise(modrinth.getProject(modSlug), () => null);
		if (projectRes.isErr()) {
			throw new Error(`Error fetching mod project: ${modSlug}`);
		}

		const project = projectRes.value;

		const versionsRes = await fromPromise(
			modrinth.getProjectVersions(project.id, {
				loaders: [loaderId],
				game_versions: [mcVersion],
			}),
			() => null,
		);

		if (versionsRes.isErr() || versionsRes.value.length === 0) {
			throw new Error(`No compatible versions found for ${project.title} (${project.slug})`);
		}

		const version = versionsRes.value[0];
		return { project, version };
	}

	async resolveAllModDependencies(
		project: Project,
		version: ProjectVersion,
		loaderId: string,
		mcVersion: string,
		existingMods: Set<string> = new Set(),
	): Promise<ModWithVersion[]> {
		const allMods: ModWithVersion[] = [];
		const processedIds = new Set<string>();

		// Queue for breadth-first traversal
		const queue: ModWithVersion[] = [{ project, version }];

		while (queue.length > 0) {
			const current = queue.shift()!;

			// Skip if already processed or already exists in modpack
			if (processedIds.has(current.project.id) || existingMods.has(current.project.slug)) {
				continue;
			}

			processedIds.add(current.project.id);
			allMods.push(current);

			// Process dependencies
			for (const dependency of current.version.dependencies) {
				if (dependency.dependency_type !== 'required') continue;

				try {
					let depProject: Project;
					let depVersion: ProjectVersion;

					if (dependency.project_id) {
						const result = await this.getProjectWithVersion(
							dependency.project_id,
							loaderId,
							mcVersion,
						);
						depProject = result.project;
						depVersion = result.version;
					} else if (dependency.version_id) {
						// Handle version-specific dependencies
						const versionRes = await fromPromise(
							modrinth.getVersion(dependency.version_id),
							() => null,
						);
						if (versionRes.isErr()) continue;

						depVersion = versionRes.value;

						const projectRes = await fromPromise(
							modrinth.getProject(depVersion.project_id),
							() => null,
						);
						if (projectRes.isErr()) continue;

						depProject = projectRes.value;
					} else {
						continue;
					}

					// Add to queue if not already processed
					if (!processedIds.has(depProject.id) && !existingMods.has(depProject.slug)) {
						queue.push({ project: depProject, version: depVersion });
					}
				} catch (error) {
					console.warn(
						`Failed to resolve dependency: ${dependency.project_id || dependency.version_id}`,
						error,
					);
					// Continue processing other dependencies
				}
			}
		}

		return allMods;
	}

	createModTomlContent(project: Project, version: ProjectVersion): string {
		return `
name = "${project.title}"
filename = "${version.files[0].file_type}"
side = "both"

[download]
url = "${version.files[0].url}"
hash-format = "${Object.keys(version.files[0].hashes)[0]}"
hash = "${Object.values(version.files[0].hashes)[0]}"

[update]
[update.modrinth]
mod-id = "${project.id}"
version = "${version.id}"`;
	}
}
