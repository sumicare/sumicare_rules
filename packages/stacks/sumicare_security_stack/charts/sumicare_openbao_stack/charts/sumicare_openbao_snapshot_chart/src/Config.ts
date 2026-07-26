/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { defineConfig, defineConfigMap } from "@sumicare/chart-commons";
import { z } from "zod";

const snapshotConfig = defineConfig({
	chartName: "OpenbaoSnapshotChart",
	base: [
		"name",
		"namespace",
		"version",
		"image",
		"imagePullPolicy",
		"enabled",
		"runAsUser",
		"runAsGroup",
		"fsGroup",
		"revisionHistoryLimit",
	],
	shared: ["resourceTier", "tolerations"],
	fields: {
		schedule: z.string().describe("Cron schedule expression"),
		restartPolicy: z.enum(["Never", "OnFailure"]).default("OnFailure"),
		s3: z.object({
			host: z.string(),
			bucket: z.string(),
			uri: z.string(),
			expireDays: z.string().optional(),
			extraFlag: z.string().optional(),
		}),
		bao: z.object({
			addr: z.string(),
			authPath: z.string(),
			role: z.string(),
		}),
		credentialsSecret: z
			.string()
			.describe("Secret name containing snapshot credentials"),
	},
});

export const SnapshotConfigSchema = snapshotConfig.schema;
export const SnapshotConfigError = snapshotConfig.ConfigError;
export type SnapshotConfig = z.infer<typeof SnapshotConfigSchema>;
export const SnapshotConfigMap = defineConfigMap<SnapshotConfig>(
	{
		component: "snapshot",
		name: (c) => `${c.name}-snapshot`,
		dataSchema: z.object({
			S3_HOST: z.string(),
			S3_BUCKET: z.string(),
			S3_URI: z.string(),
			S3_EXPIRE_DAYS: z.string(),
			S3CMD_EXTRA_FLAG: z.string().optional(),
			BAO_AUTH_PATH: z.string(),
			BAO_ROLE: z.string(),
			BAO_ADDR: z.string(),
		}),
		map: (c) => ({
			S3_HOST: c.s3.host,
			S3_BUCKET: c.s3.bucket,
			S3_URI: c.s3.uri,
			S3_EXPIRE_DAYS: c.s3.expireDays ?? "",
			...(c.s3.extraFlag ? { S3CMD_EXTRA_FLAG: c.s3.extraFlag } : {}),
			BAO_AUTH_PATH: c.bao.authPath,
			BAO_ROLE: c.bao.role,
			BAO_ADDR: c.bao.addr,
		}),
	},
	SnapshotConfigError,
);

export type SnapshotChartProps = {
	config: SnapshotConfig;
};
