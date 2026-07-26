/**
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { K8S_RESOURCES } from "Commons/Rbac/Resources";

import { ApiObject, JsonPatch } from "cdk8s";
import {
	ApiResource,
	ClusterRole,
	ClusterRoleBinding,
	type ClusterRolePolicyRule,
	type IApiEndpoint,
	type IApiResource,
	type IServiceAccount,
	Role,
	RoleBinding,
	type RolePolicyRule,
	ServiceAccount,
} from "cdk8s-plus-33";
import { Construct } from "constructs";

/** Converts camelCase or PascalCase to kebab-case. */
const camelToKebab = (s: string) =>
	s
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
		.toLowerCase();

/** Base props passed to the RBAC construct at instantiation time. */
type BaseProps = {
	name: string;
	namespace: string;
	labels?: Record<string, string>;
};

/** Kubernetes RBAC verb. `"*"` is a wildcard matching all verbs. */
type Verb =
	| "get"
	| "list"
	| "watch"
	| "create"
	| "update"
	| "patch"
	| "delete"
	| "deletecollection"
	| "approve"
	| "sign"
	| "*";

/**
 * Endpoint input for RBAC rules — one of:
 * - A key from {@link K8S_RESOURCES} (e.g. `"pods"`, `"vpaCheckpoints"`)
 * - A custom `{ apiGroup, resourceType }` object
 * - A raw `IApiEndpoint` from cdk8s-plus-33
 */
type EndpointInput =
	| keyof typeof K8S_RESOURCES
	| { apiGroup: string; resourceType: string }
	| IApiEndpoint;

/** A single RBAC policy rule within a role. */
type Rule<P extends Record<string, unknown> = Record<string, unknown>> = {
	verbs: Verb[];
	endpoints: EndpointInput[];
	/** Static resource names or a function resolved from props at synthesis time. */
	resourceNames?: string[] | ((props: BaseProps & P) => string[]);
	/** Conditional inclusion — rule is skipped when this returns `false`. */
	when?: (props: BaseProps & P) => boolean;
};

/** Declarative definition of a ClusterRole or Role. */
type RoleDef<
	SA extends string = string,
	P extends Record<string, unknown> = Record<string, unknown>,
> = {
	name: string;
	scope?: "cluster" | "namespace";
	namespace?: string;
	rules: Rule<P>[];
	/** Service account keys to bind to this role. */
	bind?: SA[];
	/** Bind a cluster-scoped role into specific namespaces. */
	bindInNamespace?: { namespace: string; serviceAccount: SA }[];
	/** Conditional inclusion — entire role is skipped when this returns `false`. */
	when?: (props: BaseProps & P) => boolean;
	/** Per-role labels merged on top of `props.labels`. */
	labels?: Record<string, string>;
};

/** Resolves an `EndpointInput` to a concrete `IApiEndpoint` for cdk8s. */
const resolveEndpoint = (input: EndpointInput) => {
	if (typeof input === "string") {
		const r = K8S_RESOURCES[input];
		if (!r) throw new Error(`Unknown K8s resource key: "${input}"`);
		return r;
	}
	if ("apiGroup" in input && "resourceType" in input) {
		return ApiResource.custom(input);
	}
	return input;
};

/**
 * Defines a declarative RBAC construct factory for Kubernetes charts.
 *
 * Generates ServiceAccounts, ClusterRoles, Roles, and their bindings from a
 * single declarative configuration. Supports per-rule and per-role conditional
 * inclusion via `when` predicates, `resourceNames` for fine-grained rules,
 * and cross-namespace binding for cluster-scoped roles.
 */
export const defineRbac = <
	SA extends string,
	P extends Record<string, unknown> = Record<string, unknown>,
>(opts: {
	name: string;
	serviceAccounts: SA[];
	roles: RoleDef<SA, P>[];
}): (new (
	scope: Construct,
	id: string,
	props: BaseProps &
		P & {
			serviceAccounts?: Record<SA, IServiceAccount>;
		},
) => Construct & {
	serviceAccounts: Record<SA, IServiceAccount>;
	clusterRoles: Map<string, ClusterRole>;
	roles: Map<string, Role>;
}) => {
	const saKeys = opts.serviceAccounts;

	const saKeySet = new Set<string>(saKeys);
	const seenRoleNames = new Set<string>();
	for (const roleDef of opts.roles) {
		if (seenRoleNames.has(roleDef.name))
			throw new Error(`Duplicate role name "${roleDef.name}"`);
		seenRoleNames.add(roleDef.name);
		for (const sa of roleDef.bind ?? [])
			if (!saKeySet.has(sa))
				throw new Error(
					`Role "${roleDef.name}" binds unknown service account "${sa}"`,
				);
		for (const bin of roleDef.bindInNamespace ?? [])
			if (!saKeySet.has(bin.serviceAccount))
				throw new Error(
					`Role "${roleDef.name}" bindInNamespace references unknown service account "${bin.serviceAccount}"`,
				);
	}

	const saName = (saKey: SA, props: BaseProps & P) => {
		const suffix = camelToKebab(saKey);
		return suffix !== props.name ? `${props.name}-${suffix}` : props.name;
	};

	const buildServiceAccounts = (self: Construct, props: BaseProps & P) => {
		const labels = props.labels ?? {};

		return Object.fromEntries(
			saKeys.map((saKey) => {
				const name = saName(saKey, props);
				const saLabels = {
					...labels,
					"app.kubernetes.io/component": camelToKebab(saKey),
				};
				return [
					saKey,
					new ServiceAccount(self, `sa-${saKey}`, {
						metadata: { name, namespace: props.namespace, labels: saLabels },
					}),
				];
			}),
		) as unknown as Record<SA, IServiceAccount>;
	};

	/**
	 * Builds all roles (ClusterRole/Role), their bindings, and applies
	 * named-resource rules via JsonPatch.
	 *
	 * Rules are split into:
	 * - **regularRules** — added directly to the role's `rules` array
	 * - **namedRules** — rules with `resourceNames`, applied via `JsonPatch.add`
	 *   since cdk8s-plus-33 doesn't support `resourceNames` in its rule builder
	 */
	const buildRoles = (
		self: Construct,
		props: BaseProps & P,
		sas: Record<SA, IServiceAccount>,
	) => {
		const labels = props.labels ?? {};
		const clusterRoles = new Map<string, ClusterRole>();
		const roles = new Map<string, Role>();

		const getSa = (saKey: SA, roleName: string) => {
			const sa = sas[saKey];
			if (!sa)
				throw new Error(
					`ServiceAccount "${saKey}" not found for role "${roleName}"`,
				);
			return sa;
		};

		const mergeLabels = (roleDef: RoleDef<SA, P>) => ({
			...labels,
			...roleDef.labels,
		});

		const applyNamedRules = (
			evaluated: { rule: Rule<P>; active: boolean }[],
			roleObj: ClusterRole | Role,
		) => {
			const namedRules = evaluated.filter(
				(r) => r.active && r.rule.resourceNames,
			);
			if (namedRules.length === 0) return;

			const apiObj = ApiObject.of(roleObj);
			for (const { rule } of namedRules) {
				const names =
					typeof rule.resourceNames === "function"
						? rule.resourceNames(props)
						: rule.resourceNames;
				if (!names) continue;
				for (const endpoint of rule.endpoints) {
					const resource = resolveEndpoint(endpoint).asApiResource();
					apiObj.addJsonPatch(
						JsonPatch.add("/rules/-", {
							apiGroups: resource ? [resource.apiGroup ?? ""] : [""],
							resources: resource ? [resource.resourceType] : [],
							resourceNames: names,
							verbs: rule.verbs,
						}),
					);
				}
			}
		};

		for (const roleDef of opts.roles) {
			if (roleDef.when && !roleDef.when(props)) continue;

			const scope = roleDef.scope ?? "cluster";
			const evaluatedRules = roleDef.rules.map((r) => ({
				rule: r,
				active: !r.when || r.when(props),
			}));
			const regularRules = evaluatedRules
				.filter((r) => r.active && !r.rule.resourceNames)
				.map((r) => ({
					verbs: r.rule.verbs,
					endpoints: r.rule.endpoints.map(resolveEndpoint),
				}));
			const subjects = (roleDef.bind ?? []).map((sa) =>
				getSa(sa, roleDef.name),
			);
			const roleLabels = mergeLabels(roleDef);

			if (scope === "cluster") {
				const cr = new ClusterRole(self, `cr-${roleDef.name}`, {
					metadata: { name: roleDef.name, labels: roleLabels },
					rules: regularRules as ClusterRolePolicyRule[],
				});
				clusterRoles.set(roleDef.name, cr);

				if (subjects.length > 0) {
					const crb = new ClusterRoleBinding(self, `crb-${roleDef.name}`, {
						metadata: { name: roleDef.name, labels: roleLabels },
						role: cr,
					});
					crb.addSubjects(...subjects);
				}
				for (const bin of roleDef.bindInNamespace ?? []) {
					const rb = new RoleBinding(
						self,
						`rbns-${roleDef.name}-${bin.namespace}`,
						{
							metadata: {
								name: `${roleDef.name}-${bin.namespace}`,
								namespace: bin.namespace,
								labels: roleLabels,
							},
							role: cr,
						},
					);
					rb.addSubjects(getSa(bin.serviceAccount, roleDef.name));
				}

				applyNamedRules(evaluatedRules, cr);
			} else {
				const ns = roleDef.namespace ?? props.namespace;
				const role = new Role(self, `role-${roleDef.name}`, {
					metadata: { name: roleDef.name, namespace: ns, labels: roleLabels },
					rules: regularRules.map((r) => ({
						verbs: r.verbs,
						resources: r.endpoints
							.map((e) => e.asApiResource())
							.filter((e): e is IApiResource => e !== undefined),
					})) as RolePolicyRule[],
				});
				roles.set(roleDef.name, role);

				if (subjects.length > 0) {
					const rb = new RoleBinding(self, `rb-${roleDef.name}`, {
						metadata: { name: roleDef.name, namespace: ns, labels: roleLabels },
						role,
					});
					rb.addSubjects(...subjects);
				}

				applyNamedRules(evaluatedRules, role);
			}
		}

		return { clusterRoles, roles };
	};

	class RbacConstruct extends Construct {
		readonly serviceAccounts: Record<SA, IServiceAccount>;
		readonly clusterRoles: Map<string, ClusterRole>;
		readonly roles: Map<string, Role>;

		constructor(
			scope: Construct,
			id: string,
			props: BaseProps &
				P & {
					serviceAccounts?: Record<SA, IServiceAccount>;
				},
		) {
			super(scope, id);
			this.serviceAccounts =
				props.serviceAccounts ?? buildServiceAccounts(this, props);
			const { clusterRoles, roles } = buildRoles(
				this,
				props,
				this.serviceAccounts,
			);
			this.clusterRoles = clusterRoles;
			this.roles = roles;
		}
	}

	return RbacConstruct as new (
		scope: Construct,
		id: string,
		props: BaseProps &
			P & {
				serviceAccounts?: Record<SA, IServiceAccount>;
			},
	) => Construct & {
		serviceAccounts: Record<SA, IServiceAccount>;
		clusterRoles: Map<string, ClusterRole>;
		roles: Map<string, Role>;
	};
};
