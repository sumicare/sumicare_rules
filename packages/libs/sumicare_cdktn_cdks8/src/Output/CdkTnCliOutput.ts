/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { StackOutputs } from "CdkTnCdk8s/Output/StackOutputs";
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import type { App } from "cdktn";
import { TerraformStack } from "cdktn";

/** Configuration for the CDKTN CLI output fetch. */
export type CdkTnCliOutputConfig = {
	readonly appDir?: string;
	readonly outputsFile?: string;
	readonly includeSensitiveOutputs?: boolean;
	readonly skipProviderLock?: boolean;
	readonly disablePluginCache?: boolean;
	readonly parallelism?: number;
	readonly logLevel?: string;
	readonly logFileDirectory?: string;
	readonly binary?: "tofu" | "terraform";
};

export const createCdkTnCliOutput = (config?: CdkTnCliOutputConfig) => ({
	fetch: (app: App) => fetchOutputsViaCdkTnCli(app, config),
});

const fetchOutputsViaCdkTnCli = (app: App, config?: CdkTnCliOutputConfig) => {
	const appDir = config?.appDir ?? "cdktn.out";
	const outputsFile = config?.outputsFile ?? "outputs.json";
	const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "cdktn-project-"));

	try {
		app.synth();
		fs.cpSync(app.outdir, path.join(projectDir, appDir), {
			recursive: true,
		});
		fs.writeFileSync(
			path.join(projectDir, "cdktf.json"),
			JSON.stringify({ language: "python", app: appDir }),
		);

		execFileSync("cdktn", buildCdkTnArgs(app, appDir, outputsFile, config), {
			cwd: projectDir,
			env: buildCdkTnEnv(config),
			stdio: "pipe",
			timeout: 3_000,
		});

		return JSON.parse(
			fs.readFileSync(path.join(projectDir, outputsFile), "utf-8"),
		) as StackOutputs;
	} finally {
		fs.rmSync(projectDir, { recursive: true, force: true });
	}
};

export const buildCdkTnArgs = (
	app: App,
	appDir: string,
	outputsFile: string,
	config?: CdkTnCliOutputConfig,
) => [
	"output",
	"--skip-synth",
	"--output",
	appDir,
	"--outputs-file",
	outputsFile,
	...app.node
		.findAll()
		.filter((c): c is TerraformStack => TerraformStack.isStack(c))
		.map((s) => s.node.id),
	...(config?.includeSensitiveOutputs
		? ["--outputs-file-include-sensitive-outputs"]
		: []),
	...(config?.skipProviderLock ? ["--skip-provider-lock"] : []),
	...(config?.disablePluginCache ? ["--disable-plugin-cache-env"] : []),
	...(config?.logLevel ? ["--log-level", config.logLevel] : []),
	...(config?.logFileDirectory
		? ["--log-file-directory", config.logFileDirectory]
		: []),
];

export const buildCdkTnEnv = (config?: CdkTnCliOutputConfig) => {
	const env = { ...process.env };
	env.TERRAFORM_BINARY_NAME = config?.binary ?? "tofu";
	if (config?.parallelism !== undefined && config.parallelism !== -1)
		env.CDKTF_PARALLELISM = String(config.parallelism);
	return env;
};
