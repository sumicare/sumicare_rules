/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { SnapshotConfig } from "Openbao/Snapshot/Config";
import {
	type CronJobDef,
	defineCronJob,
	hardenedContainer,
} from "@sumicare/chart-commons";
import { type Cron, JsonPatch } from "cdk8s";
import type { Construct } from "constructs";

export class OpenbaoSnapshotCronJob extends defineCronJob<SnapshotConfig>({
	cronJobs: (_scope, config) => [
		{
			id: "cronjob",
			name: `${config.name}-snapshot`,
			component: "snapshot",
			schedule: config.schedule as unknown as Cron,
			concurrencyPolicy: "Forbid",
			successfulJobsHistoryLimit: 3,
			failedJobsHistoryLimit: 5,
			restartPolicy: config.restartPolicy,
			automountServiceAccountToken: true,
			tolerations: config.tolerations,
			containers: [
				{
					name: "bao-snapshot",
					image: `${config.image}:v${config.version}`,
					imagePullPolicy: config.imagePullPolicy as
						| "Always"
						| "IfNotPresent"
						| "Never"
						| undefined,
					resources: config.resourceTier,
					securityContext: hardenedContainer({
						runAsUser: config.runAsUser,
						runAsGroup: config.runAsGroup,
					}),
				},
			],
			volumes: [{ name: "snapshot-dir", emptyDir: {} }],
			extraPatches: [
				JsonPatch.add(
					"/spec/jobTemplate/spec/template/spec/serviceAccountName",
					`${config.name}-snapshot`,
				),
				JsonPatch.add(
					"/spec/jobTemplate/spec/template/spec/containers/0/envFrom",
					[
						{
							configMapRef: {
								name: `${config.name}-snapshot`,
							},
						},
					],
				),
				JsonPatch.add("/spec/jobTemplate/spec/template/spec/containers/0/env", [
					{
						name: "AWS_SECRET_ACCESS_KEY",
						valueFrom: {
							secretKeyRef: {
								name: config.credentialsSecret,
								key: "AWS_SECRET_ACCESS_KEY",
							},
						},
					},
					{
						name: "AWS_ACCESS_KEY_ID",
						valueFrom: {
							secretKeyRef: {
								name: config.credentialsSecret,
								key: "AWS_ACCESS_KEY_ID",
							},
						},
					},
				]),
				JsonPatch.add(
					"/spec/jobTemplate/spec/template/spec/containers/0/volumeMounts",
					[{ name: "snapshot-dir", mountPath: "/bao-snapshots" }],
				),
			],
		} satisfies CronJobDef<SnapshotConfig>,
	],
}) {
	constructor(scope: Construct, config: SnapshotConfig) {
		super(scope, "snapshot-cronjob", config);
	}
}
