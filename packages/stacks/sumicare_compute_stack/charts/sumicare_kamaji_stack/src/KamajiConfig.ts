/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestKamajiVersion } from "Kamaji/Stack/Version";
import { ChartConfigError } from "@sumicare/chart-commons";
import { z } from "zod";

const SyncPolicySchema = z.object({
	automated: z
		.object({
			prune: z.boolean().default(true),
			selfHeal: z.boolean().default(true),
		})
		.prefault({}),
	syncOptions: z.array(z.string()).default(["CreateNamespace=true"]),
});

/** Zod schema for validating Kamaji stack app-of-apps configuration. */
export const KamajiAppConfigSchema = z.object({
	name: z
		.string()
		.describe("Name of the parent app-of-apps Application")
		.default("kamaji"),
	version: z
		.string()
		.describe("Kamaji version label for all resources")
		.default(KnownLatestKamajiVersion),
	namespace: z
		.string()
		.describe("Namespace where ArgoCD resources are deployed")
		.default("argocd"),
	destinationNamespace: z
		.string()
		.describe("Destination namespace for Kamaji resources")
		.default("kamaji-system"),
	destinationServer: z
		.string()
		.describe("Destination cluster server URL")
		.default("https://kubernetes.default.svc"),
	repoURL: z
		.string()
		.describe("Git repository URL containing the Kamaji manifests")
		.default(""),
	targetRevision: z.string().default("HEAD"),
	basePath: z
		.string()
		.describe(
			"Base path in the repo for the Kamaji stack (where child Application manifests live)",
		)
		.default("charts/sumicare_compute_stack/charts/sumicare_kamaji_stack"),
	components: z
		.array(
			z.object({
				name: z.string(),
				path: z
					.string()
					.describe("Sub-path under basePath for this component's manifests"),
				enabled: z.boolean().default(true),
				syncWave: z.number().default(0),
			}),
		)
		.default([
			{
				name: "etcd",
				path: "charts/sumicare_kamaji_etcd_chart",
				enabled: true,
				syncWave: 0,
			},
			{
				name: "controller",
				path: "charts/sumicare_kamaji_controller_chart",
				enabled: true,
				syncWave: 1,
			},
			{
				name: "datastore",
				path: "charts/sumicare_kamaji_datastore_chart",
				enabled: true,
				syncWave: 2,
			},
			{
				name: "kubeconfig-generator",
				path: "charts/sumicare_kamaji_kubeconfig_generator_chart",
				enabled: false,
				syncWave: 3,
			},
			{
				name: "console",
				path: "charts/sumicare_kamaji_console_chart",
				enabled: true,
				syncWave: 4,
			},
		]),
	project: z
		.object({
			enabled: z.boolean().default(true),
			description: z.string().default("Kamaji control plane stack"),
			destinations: z
				.array(
					z.object({
						server: z.string(),
						namespace: z.string(),
					}),
				)
				.default([]),
			clusterResourceWhitelist: z
				.array(
					z.object({
						group: z.string(),
						kind: z.string(),
					}),
				)
				.default([]),
		})
		.prefault({}),
	syncPolicy: SyncPolicySchema.prefault({}),
});

export type AppConfig = z.infer<typeof KamajiAppConfigSchema>;

export class KamajiAppConfigError extends ChartConfigError {
	constructor(id: string, error: z.core.$ZodError) {
		super("KamajiApp", id, error);
		this.name = "KamajiAppConfigError";
	}
}
