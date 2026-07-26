/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { existsSync, readdirSync } from "node:fs";
import { Octokit } from "octokit";
import { compare, parse } from "semver";

export type GitHubRepo = { owner: string; repo: string };

/** Gitea repository identifier. */
export type GiteaRepo = {
	owner: string;
	repo: string;
	baseUrl: string;
	branch?: string;
};

/** Upstream GitHub repository source for a CRD file. */
export type GithubUpstreamSource = {
	repo: GitHubRepo;
	path: string;
	branch?: string;
	upstreamFile?: string;
};

/** Upstream Gitea repository source for a CRD file. */
export type GiteaUpstreamSource = {
	gitea: GiteaRepo;
	path: string;
	upstreamFile?: string;
};

/** Any upstream source (GitHub or Gitea). */
export type UpstreamSource = GithubUpstreamSource | GiteaUpstreamSource;

const TIMEOUT_MS = 30_000;

const createOctokit = () => {
	const token =
		process.env.GITHUB_TOKEN ??
		process.env.GH_TOKEN ??
		process.env.GH_PAT ??
		process.env.GITHUB_PAT;
	return new Octokit({
		...(token ? { auth: token } : {}),
		request: { fetch: withTimeout },
	});
};

const withTimeout = (input: string | URL, init?: RequestInit) => {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
	return fetch(input, { ...init, signal: controller.signal }).finally(() =>
		clearTimeout(timeout),
	);
};

type Release = { tag_name: string; name?: string };

/** Spec for fetching the latest release from a GitHub repository. */
export type ReleaseSpec = {
	owner: string;
	repo: string;
	namePrefix?: string;
	nameSuffix?: string;
};

/** Fetches the latest stable release version from a GitHub repository. */
export const fetchLatestRelease = async (spec: ReleaseSpec) => {
	const { owner, repo, namePrefix, nameSuffix } = spec;
	const octokit = createOctokit();
	const { data: releases } = await octokit.rest.repos.listReleases({
		owner,
		repo,
		per_page: 10,
		page: 1,
	});
	const versions = (releases as Release[])
		.filter((r) => !namePrefix || r.name?.startsWith(namePrefix))
		.map((r) => r.tag_name)
		.map((tag) => {
			if (namePrefix && tag.startsWith(namePrefix))
				return tag.slice(namePrefix.length);
			if (tag.startsWith("v")) return tag.slice(1);
			return tag;
		})
		.map((v) =>
			nameSuffix && !v.endsWith(nameSuffix) ? `${v}${nameSuffix}` : v,
		)
		.filter((v) => parse(v) !== null)
		.sort((a, b) => compare(b, a));
	if (versions.length === 0) throw new Error("No stable releases found");
	return versions[0];
};

/** Fetches the latest commit SHA for a path in a GitHub repository. */
export const fetchFileCommitSha = async (repo: GitHubRepo, path: string) => {
	const octokit = createOctokit();
	const { data } = await octokit.rest.repos.listCommits({
		...repo,
		path,
		per_page: 1,
	});
	if (!data.length) throw new Error(`No commits found for ${path}`);
	return data[0].sha;
};

/** Fetches the latest commit SHA for a path in a Gitea repository. */
export const fetchGiteaCommitSha = async (
	repo: GiteaRepo,
	filePath: string,
) => {
	const branch = repo.branch ?? "main";
	const url = `${repo.baseUrl}/api/v1/repos/${repo.owner}/${repo.repo}/commits?sha=${encodeURIComponent(branch)}&path=${encodeURIComponent(filePath)}&limit=1`;
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
	const res = await fetch(url, { signal: controller.signal }).finally(() =>
		clearTimeout(timeout),
	);
	if (!res.ok)
		throw new Error(`Gitea API error for ${filePath}: ${res.status}`);
	const data = (await res.json()) as { sha: string }[];
	if (!data.length) throw new Error(`No commits found for ${filePath}`);
	return data[0].sha;
};

export const isGitea = (src: UpstreamSource): src is GiteaUpstreamSource =>
	"gitea" in src;

export const isMultiRepo = (
	upstream: UpstreamSource | Record<string, UpstreamSource>,
): upstream is Record<string, UpstreamSource> =>
	!("repo" in upstream) && !("gitea" in upstream);

const remoteFile = (src: UpstreamSource, file: string) =>
	src.upstreamFile ?? file;

const giteaRawUrl = (src: GiteaUpstreamSource, file: string) => {
	const branch = src.gitea.branch ?? "main";
	return `${src.gitea.baseUrl}/${src.gitea.owner}/${src.gitea.repo}/raw/branch/${branch}/${src.path}/${remoteFile(src, file)}`;
};

const githubRawUrl = (src: GithubUpstreamSource, file: string) => {
	const branch = src.branch ?? "main";
	return `https://raw.githubusercontent.com/${src.repo.owner}/${src.repo.repo}/${branch}/${src.path}/${remoteFile(src, file)}`;
};

export const rawUrl = (src: UpstreamSource, file: string) =>
	isGitea(src) ? giteaRawUrl(src, file) : githubRawUrl(src, file);

export const fetchSha = (src: UpstreamSource, file: string) =>
	isGitea(src)
		? fetchGiteaCommitSha(src.gitea, `${src.path}/${remoteFile(src, file)}`)
		: fetchFileCommitSha(src.repo, `${src.path}/${remoteFile(src, file)}`);

export const resolveCrdFiles = (
	crdsDir: string,
	upstream: UpstreamSource | Record<string, UpstreamSource>,
	files?: string[],
) =>
	isMultiRepo(upstream)
		? Object.keys(upstream).sort()
		: existsSync(crdsDir)
			? readdirSync(crdsDir)
					.filter((f) => f.endsWith(".yaml"))
					.sort()
			: (files ?? []).sort();

export const lookupUpstream = (
	upstream: UpstreamSource | Record<string, UpstreamSource>,
) =>
	isMultiRepo(upstream)
		? (file: string) => {
				const src = upstream[file];
				if (!src) throw new Error(`No upstream source for ${file}`);
				return src;
			}
		: () => upstream as UpstreamSource;
