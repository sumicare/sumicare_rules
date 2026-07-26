/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { commonLabels } from "Commons/Workloads/Labels";
import { ApiObject } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

// ── Schemas ───────────────────────────────────────────────────────────

/** Zod schema for PodDisruptionBudget configuration. */
export const PdbConfigSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	minAvailable: z
		.union([z.number().int().min(0), z.string()])
		.describe("Min available pods or percentage (e.g. 1 or '50%')")
		.optional(),
	maxUnavailable: z
		.union([z.number().int().min(0), z.string()])
		.describe("Max unavailable pods or percentage")
		.optional(),
});

// ── PodDisruptionBudget ───────────────────────────────────────────────

/** Options for {@link definePodDisruptionBudget}. */
export interface DefinePdbOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	minAvailable?: number | string;
	maxUnavailable?: number | string;
	labels?: Record<string, string>;
}

/** Creates a PodDisruptionBudget via ApiObject. Returns the created ApiObject. */
export const definePodDisruptionBudget = (opts: DefinePdbOpts): ApiObject => {
	const labels = {
		...commonLabels({ name: opts.name, version: opts.version }),
		...(opts.component
			? { "app.kubernetes.io/component": opts.component }
			: {}),
		...opts.labels,
	};

	const selector = {
		matchLabels: {
			"app.kubernetes.io/name": opts.name,
			"app.kubernetes.io/instance": opts.name,
			...(opts.component
				? { "app.kubernetes.io/component": opts.component }
				: {}),
		},
	};

	const spec: Record<string, unknown> = { selector };

	if (opts.minAvailable !== undefined) {
		spec.minAvailable = opts.minAvailable;
	} else if (opts.maxUnavailable !== undefined) {
		spec.maxUnavailable = opts.maxUnavailable;
	} else {
		spec.minAvailable = 1;
	}

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "policy/v1",
		kind: "PodDisruptionBudget",
		metadata: {
			name: opts.component ? `${opts.name}-${opts.component}` : opts.name,
			namespace: opts.namespace,
			labels,
		},
		spec,
	});
};
