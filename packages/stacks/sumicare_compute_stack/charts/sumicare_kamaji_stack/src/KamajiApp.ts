/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type AppConfig,
	KamajiAppConfigError,
	KamajiAppConfigSchema,
} from "Kamaji/Stack/KamajiConfig";
import { commonLabels } from "@sumicare/chart-commons";
import {
	ArgoCdApplication as Application,
	ArgoCdAppProject as AppProject,
} from "@sumicare/stack-gitops-crds";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof KamajiAppConfigSchema>;

export type KamajiAppProps = ChartProps & ConfigInput;

/**
 * CDK8s chart that generates ArgoCD GitOps resources using the app-of-apps pattern:
 * - An optional AppProject scoping the Kamaji stack
 * - A parent Application pointing to basePath (syncs child Application manifests)
 * - One child Application per enabled component, each pointing to its manifest path
 *
 * Sync waves on child Applications enforce ordering: etcd -> controller -> datastore
 * -> kubeconfig-generator -> console.
 *
 * This lives at the stack level (not a separate chart) because it orchestrates
 * all child charts as a single deployable unit.
 */
export class KamajiApp extends Chart {
	readonly config: AppConfig;
	readonly appProject: AppProject | undefined;
	readonly parentApp: Application;
	readonly childApps: Application[] = [];

	constructor(scope: Construct, id: string, props: KamajiAppProps = {}) {
		super(scope, id, props);

		const result = KamajiAppConfigSchema.safeParse(props);
		if (!result.success) {
			throw new KamajiAppConfigError(id, result.error);
		}
		this.config = result.data;

		const labels = commonLabels(this.config);

		if (this.config.project.enabled) {
			const destinations =
				this.config.project.destinations.length > 0
					? this.config.project.destinations
					: [
							{
								server: this.config.destinationServer,
								namespace: this.config.destinationNamespace,
							},
						];

			this.appProject = new AppProject(this, "project", {
				metadata: {
					name: this.config.name,
					namespace: this.config.namespace,
					labels,
				},
				spec: {
					description: this.config.project.description,
					destinations: destinations.map((d) => ({
						server: d.server,
						namespace: d.namespace,
					})),
					sourceRepos: this.config.repoURL ? [this.config.repoURL] : [],
					...(this.config.project.clusterResourceWhitelist.length > 0
						? {
								clusterResourceWhitelist:
									this.config.project.clusterResourceWhitelist,
							}
						: {}),
				},
			});
		}

		this.parentApp = new Application(this, "parent-app", {
			metadata: {
				name: this.config.name,
				namespace: this.config.namespace,
				labels,
				annotations: {
					"argocd.argoproj.io/sync-wave": "-1",
				},
			},
			spec: {
				project: this.config.project.enabled ? this.config.name : "default",
				destination: {
					server: this.config.destinationServer,
					namespace: this.config.namespace,
				},
				source: {
					repoUrl: this.config.repoURL,
					targetRevision: this.config.targetRevision,
					path: this.config.basePath,
				},
				syncPolicy: {
					automated: {
						prune: this.config.syncPolicy.automated.prune,
						selfHeal: this.config.syncPolicy.automated.selfHeal,
					},
					syncOptions: this.config.syncPolicy.syncOptions,
				},
			},
		});

		for (const component of this.config.components) {
			if (!component.enabled) continue;

			const app = new Application(this, `app-${component.name}`, {
				metadata: {
					name: `${this.config.name}-${component.name}`,
					namespace: this.config.namespace,
					labels: {
						...labels,
						"app.kubernetes.io/component": component.name,
					},
					annotations: {
						"argocd.argoproj.io/sync-wave": String(component.syncWave),
					},
				},
				spec: {
					project: this.config.project.enabled ? this.config.name : "default",
					destination: {
						server: this.config.destinationServer,
						namespace: this.config.destinationNamespace,
					},
					source: {
						repoUrl: this.config.repoURL,
						targetRevision: this.config.targetRevision,
						path: `${this.config.basePath}/${component.path}`,
					},
					syncPolicy: {
						automated: {
							prune: this.config.syncPolicy.automated.prune,
							selfHeal: this.config.syncPolicy.automated.selfHeal,
						},
						syncOptions: this.config.syncPolicy.syncOptions,
					},
				},
			});

			this.childApps.push(app);
		}
	}
}
