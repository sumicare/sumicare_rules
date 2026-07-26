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

/** Zod schema for OpenBao CSI SecretProviderClass configuration. */
export const OpenBaoSpcSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	vaultAddress: z
		.string()
		.describe("OpenBao server address (e.g. https://openbao.openbao.svc:8200)")
		.default("https://openbao.openbao.svc:8200"),
	vaultRole: z
		.string()
		.describe("OpenBao auth role for this workload")
		.default(""),
	pkiPath: z
		.string()
		.describe("Path to the PKI secret engine mount (e.g. pki/issue/role)")
		.default(""),
	secretName: z
		.string()
		.describe("Name of the synced Kubernetes Secret")
		.optional(),
	dnsNames: z
		.array(z.string())
		.describe("DNS subjectAltNames for the TLS certificate")
		.default([]),
	ttl: z
		.string()
		.describe("TTL for the TLS certificate (Go duration)")
		.default("24h"),
});

// ── SecretProviderClass ───────────────────────────────────────────────

/** Options for {@link defineSecretProviderClass}. */
export interface DefineSpcOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	vaultAddress: string;
	vaultRole: string;
	pkiPath: string;
	secretName?: string;
	dnsNames?: string[];
	ttl: string;
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/**
 * Creates a SecretProviderClass using the OpenBao CSI provider
 * to fetch TLS certificates from OpenBao's PKI secret engine,
 * syncing them to a Kubernetes Secret.
 */
export const defineSecretProviderClass = (opts: DefineSpcOpts): ApiObject => {
	const labels = {
		...commonLabels({ name: opts.name, version: opts.version }),
		...(opts.component
			? { "app.kubernetes.io/component": opts.component }
			: {}),
		...opts.labels,
	};

	const resourceName = opts.component
		? `${opts.name}-${opts.component}`
		: opts.name;

	const secretName = opts.secretName ?? `${resourceName}-tls`;

	const dnsNames =
		opts.dnsNames && opts.dnsNames.length > 0
			? opts.dnsNames
			: [
					`${resourceName}.${opts.namespace}.svc`,
					`${resourceName}.${opts.namespace}.svc.cluster.local`,
				];

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "secrets-store.csi.x-k8s.io/v1",
		kind: "SecretProviderClass",
		metadata: {
			name: `${resourceName}-spc`,
			namespace: opts.namespace,
			labels,
			annotations: opts.annotations,
		},
		spec: {
			provider: "openbao",
			parameters: {
				vaultAddress: opts.vaultAddress,
				vaultRole: opts.vaultRole,
				pkiPath: opts.pkiPath,
				commonName: dnsNames[0],
				altNames: dnsNames.join(","),
				ttl: opts.ttl,
			},
			secretObjects: [
				{
					secretName,
					type: "kubernetes.io/tls",
					data: [
						{ key: "tls.crt", objectName: "certificate" },
						{ key: "tls.key", objectName: "private_key" },
						{ key: "ca.crt", objectName: "issuing_ca" },
					],
				},
			],
		},
	});
};
