import { Modrinth } from 'typerinth';

export const modrinth = new Modrinth();

import { fromPromise } from 'neverthrow';
import type { Project, ProjectVersion } from 'typerinth';
import { createModToml } from '$lib';

export interface ModDependency {
	project: Project;
	version: ProjectVersion;
	dependencies: ModDependency[];
}

export class ModrinthService {
	async getProjectWithVersion(
		modSlug: string,
		loaderId: string,
		mcVersion: string
	): Promise<{ project: Project; version: ProjectVersion }> {
		const projectRes = await fromPromise(modrinth.getProject(modSlug), () => null);
		if (projectRes.isErr()) {
			throw new Error('Error fetching mod project');
		}

		const project = projectRes.value;

		const versionsRes = await fromPromise(
			modrinth.getProjectVersions(project.id, {
				loaders: [loaderId],
				game_versions: [mcVersion]
			}),
			() => null
		);

		if (versionsRes.isErr() || versionsRes.value.length === 0) {
			throw new Error('No compatible versions found for this mod');
		}

		const version = versionsRes.value[0];
		return { project, version };
	}

	async resolveModDependencies(
		project: Project,
		version: ProjectVersion,
		loaderId: string,
		mcVersion: string,
		resolved: Set<string> = new Set()
	): Promise<ModDependency[]> {
		const dependencies: ModDependency[] = [];

		// Prevent circular dependencies
		if (resolved.has(project.id)) {
			return dependencies;
		}
		resolved.add(project.id);

		for (const dependency of version.dependencies) {
			if (dependency.dependency_type !== 'required') continue;

			let depProject: Project;
			let depVersion: ProjectVersion;

			if (dependency.project_id) {
				const result = await this.getProjectWithVersion(dependency.project_id, loaderId, mcVersion);
				depProject = result.project;
				depVersion = result.version;
			} else if (dependency.version_id) {
				// Handle version-specific dependencies
				const versionRes = await fromPromise(
					modrinth.getVersion(dependency.version_id),
					() => null
				);
				if (versionRes.isErr()) continue;

				depVersion = versionRes.value;

				const projectRes = await fromPromise(
					modrinth.getProject(depVersion.project_id),
					() => null
				);
				if (projectRes.isErr()) continue;

				depProject = projectRes.value;
			} else {
				continue;
			}

			// Recursively resolve dependencies
			const nestedDeps = await this.resolveModDependencies(
				depProject,
				depVersion,
				loaderId,
				mcVersion,
				resolved
			);

			dependencies.push({
				project: depProject,
				version: depVersion,
				dependencies: nestedDeps
			});
		}

		return dependencies;
	}

	createModTomlContent(project: Project, version: ProjectVersion): string {
		return createModToml(project, version);
	}
}
