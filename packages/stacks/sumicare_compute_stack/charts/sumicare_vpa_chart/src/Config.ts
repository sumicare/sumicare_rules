/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestVpaVersion } from "Compute/Vpa/Version";
import {
	ComponentSchema,
	defineConfig,
	ExtraArgsSchema,
	type InferConfig,
	OpenBaoSpcSchema,
	VpaProbeSchema,
} from "@sumicare/chart-commons";
import { z } from "zod";

const VpaComponentSchema = ComponentSchema.extend({
	revisionHistoryLimit: z.number().min(0).default(10),
	livenessProbe: VpaProbeSchema.optional(),
	readinessProbe: VpaProbeSchema.optional(),
});

const RecommenderSchema = VpaComponentSchema.extend({
	livenessProbe: VpaProbeSchema.prefault({ port: 8942 }),
	readinessProbe: VpaProbeSchema.prefault({ port: 8942 }),
	extraArgs: ExtraArgsSchema.default({
		v: "4",
		stderrthreshold: "info",
	}),
});

const UpdaterSchema = VpaComponentSchema.extend({
	livenessProbe: VpaProbeSchema.prefault({ port: 8943 }),
	readinessProbe: VpaProbeSchema.prefault({ port: 8943 }),
	extraArgs: ExtraArgsSchema.default({
		"in-place-skip-disruption-budget": "true",
		v: "4",
		stderrthreshold: "info",
	}),
});

const vpaConfig = defineConfig({
	chartName: "VpaChart",
	base: ["revisionHistoryLimit", "runAsUser", "runAsGroup", "fsGroup"],
	shared: ["disableMetrics", "environments", "priorityClassName"],
	fields: {
		name: z.string().describe("Base name for VPA resources").default("vpa"),
		namespace: z
			.string()
			.describe("Kubernetes namespace where VPA will be deployed")
			.default("kube-system"),
		version: z
			.string()
			.describe("VPA container image version")
			.default(KnownLatestVpaVersion),
		recommender: RecommenderSchema.prefault({}).describe(
			"VPA recommender component configuration",
		),
		updater: UpdaterSchema.prefault({}).describe(
			"VPA updater component configuration",
		),
		admissionController: VpaComponentSchema.extend({
			httpPort: z
				.number()
				.min(1)
				.max(65535)
				.describe("Port for the admission controller webhook")
				.default(8000),
			metricsPort: z
				.number()
				.min(1)
				.max(65535)
				.describe("Port for the admission controller metrics")
				.default(8944),
			useHostNetwork: z
				.boolean()
				.describe(
					"Whether to use host network (required on EKS with custom CNI)",
				)
				.default(false),
			livenessProbe: VpaProbeSchema.prefault({ port: 8944 }),
			readinessProbe: VpaProbeSchema.prefault({ port: 8944 }),
			extraArgs: ExtraArgsSchema.default({ v: "4", stderrthreshold: "info" }),
		})
			.prefault({})
			.describe("VPA admission controller component configuration"),
		secretProviderClass: OpenBaoSpcSchema.prefault({}).describe(
			"OpenBao CSI SecretProviderClass configuration for HTTPS metrics certs",
		),
		webhook: z
			.object({
				failurePolicy: z
					.enum(["Ignore", "Fail"])
					.describe("Failure policy for the mutating webhook")
					.default("Ignore"),
				timeoutSeconds: z
					.number()
					.min(1)
					.max(30)
					.describe("Timeout in seconds for the webhook")
					.default(5),
			})
			.prefault({}),
	},
	resolveConfig: (parsed) => {
		const resolveImage = (
			img: string | undefined,
			defaultRepo: string,
		): string => {
			return `${img ?? defaultRepo}:${parsed.version}`;
		};
		return {
			...parsed,
			recommender: {
				...parsed.recommender,
				image: resolveImage(
					parsed.recommender.image,
					"registry.k8s.io/autoscaling/vpa-recommender",
				),
			},
			updater: {
				...parsed.updater,
				image: resolveImage(
					parsed.updater.image,
					"registry.k8s.io/autoscaling/vpa-updater",
				),
			},
			admissionController: {
				...parsed.admissionController,
				image: resolveImage(
					parsed.admissionController.image,
					"registry.k8s.io/autoscaling/vpa-admission-controller",
				),
			},
		};
	},
});

export const VpaConfigSchema = vpaConfig.schema;
export const VpaConfigError = vpaConfig.ConfigError;
export { vpaConfig };

export type Config = InferConfig<typeof vpaConfig>;
