/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { Size } from "cdk8s";
import { Cpu } from "cdk8s-plus-33";
import { z } from "zod";

/** Zod schema for Go duration strings (e.g. `"2m"`, `"15s"`, `"1h"`). */
export const DurationSchema = z
	.string()
	.regex(
		/^\d+(ns|us|µs|ms|s|m|h)$/,
		"must be a Go duration (e.g. 2m, 15s, 1h)",
	);

/** Zod schema that transforms a CPU string (e.g. `"500m"`, `"0.5"`) into a cdk8s-plus {@link Cpu}. */
export const CpuSchema = z.string().transform((s) => {
	if (s.endsWith("m")) return Cpu.millis(Number.parseInt(s.slice(0, -1), 10));
	return Cpu.units(Number.parseFloat(s));
});

/** Zod schema that transforms a size string (e.g. `"256Mi"`, `"1Gi"`) into a cdk8s {@link Size}. */
export const SizeSchema = z.string().transform((s) => {
	if (s.endsWith("Mi"))
		return Size.mebibytes(Number.parseInt(s.slice(0, -2), 10));
	if (s.endsWith("Gi"))
		return Size.gibibytes(Number.parseInt(s.slice(0, -2), 10));
	if (s.endsWith("Ki"))
		return Size.kibibytes(Number.parseInt(s.slice(0, -2), 10));
	return Size.mebibytes(Number.parseInt(s, 10));
});

/** Zod schema for resource tiers: S, M, L, XL. */
export const ResourceTierSchema = z.enum(["S", "M", "L", "XL"]);

/** Zod schema for probe configuration with universal defaults. */
export const ProbeSchema = z.object({
	initialDelaySeconds: z.number().int().min(0).default(10),
	timeoutSeconds: z.number().int().min(1).default(5),
	periodSeconds: z.number().int().min(1).default(10),
	successThreshold: z.number().int().min(1).default(1),
	failureThreshold: z.number().int().min(1).default(3),
});

/** Zod schema for pod-level security context with hardened defaults. */
export const PodSecurityContextSchema = z.object({
	runAsNonRoot: z
		.boolean()
		.describe("Run containers as non-root")
		.default(true),
	runAsUser: z.number().int().describe("UID for pod containers").default(65534),
	runAsGroup: z
		.number()
		.int()
		.describe("GID for pod containers")
		.default(65534),
	fsGroup: z
		.number()
		.int()
		.describe("FS group for mounted volumes")
		.default(65534),
	seccompProfile: z
		.object({ type: z.literal("RuntimeDefault") })
		.describe("Seccomp profile type")
		.default({ type: "RuntimeDefault" }),
});

/** Zod schema for container-level security context with hardened defaults. */
export const ContainerSecurityContextSchema = z.object({
	readOnlyRootFilesystem: z
		.boolean()
		.describe("Mount root filesystem as read-only")
		.default(true),
	allowPrivilegeEscalation: z
		.boolean()
		.describe("Allow privilege escalation")
		.default(false),
	capabilities: z
		.object({
			drop: z
				.array(z.string())
				.describe("Linux capabilities to drop")
				.default(["ALL"]),
		})
		.describe("Container capabilities")
		.default({ drop: ["ALL"] }),
	seccompProfile: z
		.object({ type: z.literal("RuntimeDefault") })
		.describe("Seccomp profile type")
		.default({ type: "RuntimeDefault" }),
});

/** Zod schema for extra CLI arguments as key-value pairs (converted via `flagsToArgs`). */
export const ExtraArgsSchema = z
	.record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
	.default({});

/** Reusable Zod schema for a single component within multi-component charts. */
export const ComponentSchema = z.object({
	enabled: z.boolean().default(true),
	replicas: z.number().min(1).default(2),
	image: z.string().optional(),
	imagePullPolicy: z
		.enum(["Always", "IfNotPresent", "Never"])
		.default("IfNotPresent"),
	extraArgs: ExtraArgsSchema,
	resourceTier: ResourceTierSchema.default("S"),
	podSecurityContext: PodSecurityContextSchema.prefault({}),
	securityContext: ContainerSecurityContextSchema.prefault({}),
	livenessProbe: ProbeSchema.prefault({}),
	readinessProbe: ProbeSchema.prefault({}),
});

/** Zod schema for VPA probe configuration with HTTP path and port. */
export const VpaProbeSchema = ProbeSchema.extend({
	path: z.string().default("/health-check"),
	port: z.number(),
});
