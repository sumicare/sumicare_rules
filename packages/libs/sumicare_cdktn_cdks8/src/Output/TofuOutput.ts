/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { execFileSync, execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { App } from "cdktn";
import { TerraformStack } from "cdktn";

/** Configuration for the direct `tofu output` fetch. */
export type TofuOutputConfig = {
	readonly appDir?: string;
	readonly statePath?: string;
	readonly showSensitive?: boolean;
	readonly vars?: Record<string, string>;
	readonly varFiles?: string[];
	readonly binary?: "tofu" | "terraform";
};

export const createTofuOutput = (config?: TofuOutputConfig) => ({
	fetch: (app: App) => fetchOutputsViaTofu(app, config),
});

const fetchOutputsViaTofu = (app: App, config?: TofuOutputConfig) => {
	const appDir = config?.appDir ?? "cdktn.out";
	const binary = config?.binary ?? "tofu";

	try {
		execSync(`${binary} --version`, { stdio: "ignore" });
	} catch {
		throw new Error(
			`${binary} not found on PATH. Install OpenTofu or Terraform to use createTofuOutput.`,
		);
	}

	const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "tofu-output-"));

	try {
		app.synth();
		fs.cpSync(app.outdir, path.join(projectDir, appDir), {
			recursive: true,
		});

		const stacks = app.node
			.findAll()
			.filter((c): c is TerraformStack => TerraformStack.isStack(c));
		return Object.fromEntries(
			stacks
				.filter((stack) => {
					const stackDir = path.join(
						projectDir,
						appDir,
						"stacks",
						stack.node.id,
					);
					/* v8 ignore next -- defensive: stack dir always exists after cpSync */
					return fs.existsSync(stackDir);
				})
				.map((stack) => {
					const stackDir = path.join(
						projectDir,
						appDir,
						"stacks",
						stack.node.id,
					);
					const stdout = execFileSync(binary, buildTofuArgs(config), {
						cwd: stackDir,
						stdio: ["pipe", "pipe", "pipe"],
					}).toString("utf-8");
					return [stack.node.id, JSON.parse(stdout)];
				}),
		);
	} finally {
		fs.rmSync(projectDir, { recursive: true, force: true });
	}
};

export const buildTofuArgs = (config?: TofuOutputConfig) => [
	"output",
	"-json",
	"-no-color",
	...(config?.statePath ? [`-state=${config.statePath}`] : []),
	...(config?.showSensitive ? ["-show-sensitive"] : []),
	...(config?.varFiles ?? []).map((vf) => `-var-file=${vf}`),
	...(config?.vars
		? Object.entries(config.vars).map(([k, v]) => `-var=${k}=${v}`)
		: []),
];
