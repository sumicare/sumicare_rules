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

/** Zod schema for Cilium NetworkPolicy configuration. */
export const CiliumPolicyConfigSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	enableDefaultDeny: z
		.object({
			ingress: z.boolean().default(true),
			egress: z.boolean().default(true),
		})
		.prefault({}),
	ingress: z
		.array(
			z.object({
				fromEndpoints: z
					.array(
						z.object({
							matchLabels: z.record(z.string(), z.string()).default({}),
						}),
					)
					.default([]),
				fromEntities: z.array(z.string()).default([]),
				fromCidr: z.array(z.string()).default([]),
				toPorts: z
					.array(
						z.object({
							port: z.number(),
							protocol: z.string().default("TCP"),
						}),
					)
					.default([]),
			}),
		)
		.default([]),
	egress: z
		.array(
			z.object({
				toEndpoints: z
					.array(
						z.object({
							matchLabels: z.record(z.string(), z.string()).default({}),
						}),
					)
					.default([]),
				toEntities: z.array(z.string()).default([]),
				toCidr: z.array(z.string()).default([]),
				toPorts: z
					.array(
						z.object({
							port: z.number(),
							protocol: z.string().default("TCP"),
						}),
					)
					.default([]),
			}),
		)
		.default([]),
});

/** Zod schema for Istio ambient mesh configuration (DestinationRule + PeerAuthentication). */
export const IstioMeshConfigSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	destinationRule: z
		.object({
			enabled: z.boolean().default(true),
			trafficPolicy: z
				.object({
					tls: z
						.object({
							mode: z
								.enum(["ISTIO_MUTUAL", "SIMPLE", "MUTUAL", "DISABLE"])
								.default("ISTIO_MUTUAL"),
						})
						.prefault({}),
				})
				.prefault({}),
		})
		.prefault({}),
	peerAuthentication: z
		.object({
			enabled: z.boolean().default(true),
			mtlsMode: z
				.enum(["UNSET", "DISABLE", "PERMISSIVE", "STRICT"])
				.default("STRICT"),
		})
		.prefault({}),
});

/** Zod schema for Istio auth (RequestAuthentication + AuthorizationPolicy). */
export const IstioAuthConfigSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	jwtRules: z
		.array(
			z.object({
				issuer: z.string().describe("JWT issuer URI"),
				jwksUri: z.string().describe("JWKS URI for key validation"),
				audiences: z.array(z.string()).default([]),
				fromHeaders: z
					.array(
						z.object({
							name: z.string().default("Authorization"),
							prefix: z.string().default("Bearer "),
						}),
					)
					.default([{ name: "Authorization", prefix: "Bearer " }]),
			}),
		)
		.default([]),
	authorizationPolicy: z
		.object({
			enabled: z.boolean().default(true),
			action: z.enum(["ALLOW", "DENY", "AUDIT"]).default("ALLOW"),
			allowedGroups: z
				.array(z.string())
				.describe("Groups claim values allowed to access the service")
				.default([]),
			allowedPrincipals: z
				.array(z.string())
				.describe("Request principals allowed to access the service")
				.default([]),
		})
		.prefault({}),
});

/** Zod schema for Gateway API Gateway configuration. */
export const GatewayConfigSchema = z.object({
	enabled: z.boolean().default(false),
	gatewayClassName: z
		.string()
		.describe("GatewayClass name (e.g. kgateway)")
		.default("kgateway"),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	listeners: z
		.array(
			z.object({
				name: z.string(),
				port: z.number().min(1).max(65535),
				protocol: z
					.enum(["HTTP", "HTTPS", "TLS", "TCP", "UDP"])
					.default("HTTP"),
				hostname: z.string().optional(),
				tls: z
					.object({
						mode: z.enum(["Terminate", "Passthrough"]).default("Terminate"),
						certificateRefs: z.array(z.any()).default([]),
					})
					.optional(),
			}),
		)
		.default([{ name: "http", port: 80, protocol: "HTTP" }]),
});

/** Zod schema for Dex OIDC authentication via KGateway GatewayExtension. */
export const DexAuthConfigSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	extensionName: z
		.string()
		.describe("Name of the KGateway GatewayExtension resource")
		.default("dex-auth"),
	issuerUri: z
		.string()
		.describe("Dex OIDC issuer URL (e.g. https://dex.dex.svc:5556/dex)")
		.default("https://dex.dex.svc:5556/dex"),
	clientId: z
		.string()
		.describe("OAuth2 client ID registered in Dex")
		.default(""),
	clientSecretRef: z
		.object({
			name: z
				.string()
				.describe("Secret containing the client-secret key")
				.default("dex-oauth-client-secret"),
			namespace: z.string().optional(),
		})
		.optional(),
	scopes: z
		.array(z.string())
		.describe("OAuth2 scopes to request (must include 'openid' for OIDC)")
		.default(["openid", "groups", "email"]),
	redirectUri: z.string().describe("OAuth2 redirect URI").optional(),
	logoutPath: z.string().default("/logout"),
	dexBackendRef: z
		.object({
			name: z
				.string()
				.describe("Name of the Backend resource for Dex")
				.default("dex"),
			namespace: z.string().optional(),
			port: z.number().default(5556),
		})
		.optional(),
});

/** Zod schema for Netbird NetworkResource configuration. */
export const NetbirdConfigSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	networkRouterRef: z
		.object({
			name: z.string().optional(),
			namespace: z.string().default("netbird-system"),
		})
		.optional(),
	groups: z
		.array(
			z.object({
				name: z.string().optional(),
				id: z.string().optional(),
			}),
		)
		.default([]),
});

/** Zod schema for Gateway API HTTPRoute configuration. */
export const HttpRouteConfigSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	parentRefs: z.array(z.any()).default([]),
	hostnames: z.array(z.string()).default([]),
	matches: z
		.array(z.any())
		.default([{ path: { type: "PathPrefix", value: "/" } }]),
});

/** Zod schema for standard Kubernetes Ingress configuration. */
export const IngressConfigSchema = z.object({
	enabled: z.boolean().default(false),
	ingressClassName: z.string().optional(),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	hosts: z
		.array(
			z.object({
				host: z.string(),
				paths: z.array(
					z.object({
						path: z.string(),
						type: z.string(),
					}),
				),
			}),
		)
		.default([]),
	tls: z.array(z.any()).default([]),
});

// ── Cilium NetworkPolicy ──────────────────────────────────────────────

/** Options for {@link defineCiliumPolicy}. */
export interface DefineCiliumPolicyOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	enableDefaultDeny?: { ingress?: boolean; egress?: boolean };
	ingress?: Array<{
		fromEndpoints?: Array<{ matchLabels: Record<string, string> }>;
		fromEntities?: string[];
		fromCidr?: string[];
		toPorts?: Array<{ port: number; protocol?: string }>;
	}>;
	egress?: Array<{
		toEndpoints?: Array<{ matchLabels: Record<string, string> }>;
		toEntities?: string[];
		toCidr?: string[];
		toPorts?: Array<{ port: number; protocol?: string }>;
	}>;
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/** Creates a Cilium NetworkPolicy for L3/L4 ingress and egress filtering. */
export const defineCiliumPolicy = (opts: DefineCiliumPolicyOpts): ApiObject => {
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

	const endpointSelector = {
		matchLabels: {
			"app.kubernetes.io/name": opts.name,
			"app.kubernetes.io/instance": opts.name,
			...(opts.component
				? { "app.kubernetes.io/component": opts.component }
				: {}),
		},
	};

	const ingress = (opts.ingress ?? []).map((rule) => ({
		...(rule.fromEndpoints && rule.fromEndpoints.length > 0
			? { fromEndpoints: rule.fromEndpoints }
			: {}),
		...(rule.fromEntities && rule.fromEntities.length > 0
			? { fromEntities: rule.fromEntities }
			: {}),
		...(rule.fromCidr && rule.fromCidr.length > 0
			? { fromCidr: rule.fromCidr }
			: {}),
		...(rule.toPorts && rule.toPorts.length > 0
			? {
					toPorts: rule.toPorts.map((p) => ({
						ports: [
							{
								port: String(p.port),
								protocol: p.protocol ?? "TCP",
							},
						],
					})),
				}
			: {}),
	}));

	const egress = (opts.egress ?? []).map((rule) => ({
		...(rule.toEndpoints && rule.toEndpoints.length > 0
			? { toEndpoints: rule.toEndpoints }
			: {}),
		...(rule.toEntities && rule.toEntities.length > 0
			? { toEntities: rule.toEntities }
			: {}),
		...(rule.toCidr && rule.toCidr.length > 0 ? { toCidr: rule.toCidr } : {}),
		...(rule.toPorts && rule.toPorts.length > 0
			? {
					toPorts: rule.toPorts.map((p) => ({
						ports: [
							{
								port: String(p.port),
								protocol: p.protocol ?? "TCP",
							},
						],
					})),
				}
			: {}),
	}));

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "cilium.io/v2",
		kind: "CiliumNetworkPolicy",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
			annotations: opts.annotations,
		},
		spec: {
			endpointSelector,
			enableDefaultDeny: {
				ingress: opts.enableDefaultDeny?.ingress ?? true,
				egress: opts.enableDefaultDeny?.egress ?? true,
			},
			...(ingress.length > 0 ? { ingress } : {}),
			...(egress.length > 0 ? { egress } : {}),
		},
	});
};

// ── Istio Mesh ────────────────────────────────────────────────────────

/** Options for {@link defineIstioMesh}. */
export interface DefineIstioMeshOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	destinationRule: {
		enabled: boolean;
		trafficPolicy?: {
			tls?: { mode?: string };
		};
	};
	peerAuthentication: {
		enabled: boolean;
		mtlsMode?: string;
	};
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/** Result of {@link defineIstioMesh}. */
export interface IstioMeshResult {
	destinationRule?: ApiObject;
	peerAuthentication?: ApiObject;
}

/**
 * Creates Istio ambient mesh resources: a DestinationRule for mTLS
 * traffic policy and a PeerAuthentication for mesh-level mTLS enforcement.
 */
export const defineIstioMesh = (opts: DefineIstioMeshOpts): IstioMeshResult => {
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

	const result: IstioMeshResult = {};

	if (opts.destinationRule.enabled) {
		result.destinationRule = new ApiObject(opts.scope, `${opts.id}-dr`, {
			apiVersion: "networking.istio.io/v1",
			kind: "DestinationRule",
			metadata: {
				name: resourceName,
				namespace: opts.namespace,
				labels,
				annotations: opts.annotations,
			},
			spec: {
				host: `${resourceName}.${opts.namespace}.svc.cluster.local`,
				...(opts.destinationRule.trafficPolicy?.tls?.mode
					? {
							trafficPolicy: {
								tls: {
									mode: opts.destinationRule.trafficPolicy.tls.mode,
								},
							},
						}
					: {}),
			},
		});
	}

	if (opts.peerAuthentication.enabled) {
		result.peerAuthentication = new ApiObject(opts.scope, `${opts.id}-pa`, {
			apiVersion: "security.istio.io/v1",
			kind: "PeerAuthentication",
			metadata: {
				name: resourceName,
				namespace: opts.namespace,
				labels,
				annotations: opts.annotations,
			},
			spec: {
				mtls: {
					mode: opts.peerAuthentication.mtlsMode ?? "STRICT",
				},
				selector: {
					matchLabels: {
						"app.kubernetes.io/name": opts.name,
						"app.kubernetes.io/instance": opts.name,
						...(opts.component
							? { "app.kubernetes.io/component": opts.component }
							: {}),
					},
				},
			},
		});
	}

	return result;
};

// ── Istio Auth ────────────────────────────────────────────────────────

/** Options for {@link defineIstioAuth}. */
export interface DefineIstioAuthOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	jwtRules?: Array<{
		issuer: string;
		jwksUri: string;
		audiences?: string[];
		fromHeaders?: Array<{ name: string; prefix: string }>;
	}>;
	authorizationPolicy: {
		enabled: boolean;
		action?: string;
		allowedGroups?: string[];
		allowedPrincipals?: string[];
	};
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/** Result of {@link defineIstioAuth}. */
export interface IstioAuthResult {
	requestAuthentication?: ApiObject;
	authorizationPolicy?: ApiObject;
}

/**
 * Creates Istio RequestAuthentication (if jwtRules provided) and
 * AuthorizationPolicy resources. When JWT rules are present, uses
 * `when` conditions for JWT-based access control. Without JWT rules,
 * uses `from.source.principals` for mesh-identity-based access control.
 */
export const defineIstioAuth = (opts: DefineIstioAuthOpts): IstioAuthResult => {
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

	const selector = {
		matchLabels: {
			"app.kubernetes.io/name": opts.name,
			"app.kubernetes.io/instance": opts.name,
			...(opts.component
				? { "app.kubernetes.io/component": opts.component }
				: {}),
		},
	};

	const result: IstioAuthResult = {};
	const jwtRules = opts.jwtRules ?? [];

	if (jwtRules.length > 0) {
		result.requestAuthentication = new ApiObject(
			opts.scope,
			`${opts.id}-reqauth`,
			{
				apiVersion: "security.istio.io/v1",
				kind: "RequestAuthentication",
				metadata: {
					name: resourceName,
					namespace: opts.namespace,
					labels,
					annotations: opts.annotations,
				},
				spec: {
					selector,
					jwtRules: jwtRules.map((rule) => ({
						issuer: rule.issuer,
						jwksUri: rule.jwksUri,
						audiences: rule.audiences,
						fromHeaders: rule.fromHeaders,
					})),
				},
			},
		);
	}

	if (opts.authorizationPolicy.enabled) {
		const hasJwt = jwtRules.length > 0;
		const allowedGroups = opts.authorizationPolicy.allowedGroups ?? [];
		const allowedPrincipals = opts.authorizationPolicy.allowedPrincipals ?? [];

		let rules: Record<string, unknown>[];

		if (hasJwt) {
			const when: Array<{ key: string; values: string[] }> = [];
			if (allowedGroups.length > 0) {
				when.push({
					key: "request.auth.claims[groups]",
					values: allowedGroups,
				});
			}
			if (allowedPrincipals.length > 0) {
				when.push({
					key: "request.auth.principal",
					values: allowedPrincipals,
				});
			}
			rules = when.length > 0 ? [{ when }] : [{}];
		} else {
			if (allowedPrincipals.length > 0) {
				rules = [
					{
						from: [
							{
								source: { principals: allowedPrincipals },
							},
						],
					},
				];
			} else {
				rules = [{}];
			}
		}

		result.authorizationPolicy = new ApiObject(opts.scope, `${opts.id}-authz`, {
			apiVersion: "security.istio.io/v1",
			kind: "AuthorizationPolicy",
			metadata: {
				name: resourceName,
				namespace: opts.namespace,
				labels,
				annotations: opts.annotations,
			},
			spec: {
				action: opts.authorizationPolicy.action ?? "ALLOW",
				selector,
				rules,
			},
		});
	}

	return result;
};

// ── Gateway API Gateway ───────────────────────────────────────────────

/** Options for {@link defineGateway}. */
export interface DefineGatewayOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	gatewayClassName: string;
	listeners: Array<{
		name: string;
		port: number;
		protocol: string;
		hostname?: string;
		tls?: {
			mode: string;
			certificateRefs: Array<Record<string, unknown>>;
		};
	}>;
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/** Creates a Gateway API Gateway resource. */
export const defineGateway = (opts: DefineGatewayOpts): ApiObject => {
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

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "gateway.networking.k8s.io/v1",
		kind: "Gateway",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
			annotations: opts.annotations,
		},
		spec: {
			gatewayClassName: opts.gatewayClassName,
			listeners: opts.listeners.map((l) => ({
				name: l.name,
				port: l.port,
				protocol: l.protocol,
				...(l.hostname ? { hostname: l.hostname } : {}),
				...(l.tls
					? {
							tls: {
								mode: l.tls.mode,
								certificateRefs: l.tls.certificateRefs,
							},
						}
					: {}),
			})),
		},
	});
};

// ── Dex Auth (KGateway GatewayExtension) ──────────────────────────────

/** Options for {@link defineDexAuth}. */
export interface DefineDexAuthOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	extensionName: string;
	issuerUri: string;
	clientId: string;
	clientSecretRef?: { name: string; namespace?: string };
	scopes: string[];
	redirectUri?: string;
	logoutPath: string;
	dexBackendRef?: { name: string; namespace?: string; port: number };
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/** Creates a KGateway GatewayExtension for Dex OIDC authentication. */
export const defineDexAuth = (opts: DefineDexAuthOpts): ApiObject => {
	const labels = {
		...commonLabels({ name: opts.name, version: opts.version }),
		...(opts.component
			? { "app.kubernetes.io/component": opts.component }
			: {}),
		...opts.labels,
	};

	const oauth2: Record<string, unknown> = {
		issuerUri: opts.issuerUri,
		scopes: opts.scopes,
		credentials: {
			clientId: opts.clientId,
			...(opts.clientSecretRef
				? {
						clientSecretRef: {
							name: opts.clientSecretRef.name,
							...(opts.clientSecretRef.namespace
								? { namespace: opts.clientSecretRef.namespace }
								: {}),
						},
					}
				: {}),
		},
		logoutPath: opts.logoutPath,
		...(opts.redirectUri ? { redirectUri: opts.redirectUri } : {}),
		...(opts.dexBackendRef
			? {
					backendRef: {
						name: opts.dexBackendRef.name,
						...(opts.dexBackendRef.namespace
							? { namespace: opts.dexBackendRef.namespace }
							: {}),
						port: opts.dexBackendRef.port,
					},
				}
			: {}),
	};

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "gateway.kgateway.dev/v1alpha1",
		kind: "GatewayExtension",
		metadata: {
			name: opts.extensionName,
			labels,
			annotations: opts.annotations,
		},
		spec: {
			oauth2,
		},
	});
};

// ── Netbird NetworkResource ───────────────────────────────────────────

/** Options for {@link defineNetbird}. */
export interface DefineNetbirdOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	networkRouterRef?: { name?: string; namespace?: string };
	serviceRef?: string;
	groups?: Array<{ name?: string; id?: string }>;
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/** Creates a Netbird NetworkResource to expose a service through a Netbird network router. */
export const defineNetbird = (opts: DefineNetbirdOpts): ApiObject => {
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

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "netbird.io/v1alpha1",
		kind: "NetworkResource",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
			annotations: opts.annotations,
		},
		spec: {
			networkRouterRef: {
				name: opts.networkRouterRef?.name ?? "",
				namespace: opts.networkRouterRef?.namespace ?? "netbird-system",
			},
			serviceRef: {
				name: opts.serviceRef ?? resourceName,
			},
			...(opts.groups && opts.groups.length > 0
				? {
						groups: opts.groups.map((g) => ({
							...(g.name ? { name: g.name } : {}),
							...(g.id ? { id: g.id } : {}),
						})),
					}
				: {}),
		},
	});
};

// ── HTTPRoute (Gateway API) ───────────────────────────────────────────

/** Options for {@link defineHttpRoute}. */
export interface DefineHttpRouteOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	parentRefs?: Array<Record<string, unknown>>;
	hostnames?: string[];
	matches?: Array<Record<string, unknown>>;
	backendRefs?: Array<Record<string, unknown>>;
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/** Creates a Gateway API HTTPRoute resource. */
export const defineHttpRoute = (opts: DefineHttpRouteOpts): ApiObject => {
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

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "gateway.networking.k8s.io/v1",
		kind: "HTTPRoute",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
			annotations: opts.annotations,
		},
		spec: {
			...(opts.parentRefs && opts.parentRefs.length > 0
				? { parentRefs: opts.parentRefs }
				: {}),
			...(opts.hostnames && opts.hostnames.length > 0
				? { hostnames: opts.hostnames }
				: {}),
			rules: [
				{
					...(opts.matches ? { matches: opts.matches } : {}),
					backendRefs: opts.backendRefs ?? [
						{
							name: resourceName,
							port: 80,
						},
					],
				},
			],
		},
	});
};

// ── Ingress ───────────────────────────────────────────────────────────

/** Options for {@link defineIngress}. */
export interface DefineIngressOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	ingressClassName?: string;
	hosts: Array<{
		host: string;
		paths: Array<{ path: string; type: string }>;
	}>;
	tls?: Array<Record<string, unknown>>;
	backendServiceName?: string;
	backendServicePort?: string | number;
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/** Creates a standard Kubernetes Ingress resource. */
export const defineIngress = (opts: DefineIngressOpts): ApiObject => {
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

	const backendService = opts.backendServiceName ?? resourceName;
	const backendPort = opts.backendServicePort ?? "http";

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "networking.k8s.io/v1",
		kind: "Ingress",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
			annotations: opts.annotations,
		},
		spec: {
			...(opts.ingressClassName
				? { ingressClassName: opts.ingressClassName }
				: {}),
			...(opts.tls && opts.tls.length > 0 ? { tls: opts.tls } : {}),
			rules: opts.hosts.map((host) => ({
				host: host.host,
				http: {
					paths: host.paths.map((p) => ({
						path: p.path,
						pathType: p.type,
						backend: {
							service: {
								name: backendService,
								port:
									typeof backendPort === "number"
										? { number: backendPort }
										: { name: backendPort },
							},
						},
					})),
				},
			})),
		},
	});
};
