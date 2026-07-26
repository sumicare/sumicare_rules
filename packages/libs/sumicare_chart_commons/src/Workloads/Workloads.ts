/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	commonLabels,
	componentLabels,
	selectorLabels,
} from "Commons/Workloads/Labels";
import { ApiObject, type Cron, Duration, JsonPatch, Size } from "cdk8s";
import {
	Capability,
	ConnectionScheme,
	type ContainerProps,
	Cpu,
	CronJob,
	DaemonSet,
	Deployment,
	DeploymentStrategy,
	type EnvFrom,
	type EnvValue,
	ImagePullPolicy,
	type IServiceAccount,
	Node,
	NodeLabelQuery,
	PercentOrAbsolute,
	Probe,
	Protocol,
	SeccompProfileType,
	Secret,
	StatefulSet,
	Topology,
	Volume,
	type Workload,
} from "cdk8s-plus-33";
import { Construct } from "constructs";

// ── Scheduling helpers (merged from Scheduling.ts) ────────────────────

export const antiSpotAffinity = Node.labeled(
	NodeLabelQuery.notIn("eks.amazonaws.com/compute-type", ["fargate", "auto"]),
	NodeLabelQuery.doesNotExist("cloud.google.com/compute-class"),
	NodeLabelQuery.notIn("kubernetes.azure.com/cluster-autoscaler-mode", [
		"automatic",
	]),
	NodeLabelQuery.notIn("cloud.google.com/gke-spot", ["true"]),
	NodeLabelQuery.notIn("kubernetes.azure.com/scalesetpriority", ["spot"]),
	NodeLabelQuery.notIn("lifecycle", ["Spot", "spot"]),
);

export const rollingUpdate = () =>
	DeploymentStrategy.rollingUpdate({
		maxSurge: PercentOrAbsolute.percent(25),
		maxUnavailable: PercentOrAbsolute.percent(25),
	});

type HardenedContainerOverrides = {
	runAsUser?: number;
	runAsGroup?: number;
	runAsNonRoot?: boolean;
	allowPrivilegeEscalation?: boolean;
	readOnlyRootFilesystem?: boolean;
};

export const hardenedContainer = (overrides?: HardenedContainerOverrides) => ({
	readOnlyRootFilesystem: overrides?.readOnlyRootFilesystem ?? true,
	allowPrivilegeEscalation: overrides?.allowPrivilegeEscalation ?? false,
	ensureNonRoot: overrides?.runAsNonRoot ?? true,
	...(overrides?.runAsUser !== undefined ? { user: overrides.runAsUser } : {}),
	...(overrides?.runAsGroup !== undefined
		? { group: overrides.runAsGroup }
		: {}),
	capabilities: { drop: [Capability.ALL] },
	seccompProfile: { type: SeccompProfileType.RUNTIME_DEFAULT },
});

export const applyPodSeccomp = (workload: Workload) => {
	ApiObject.of(workload).addJsonPatch(
		JsonPatch.add("/spec/template/spec/securityContext/seccompProfile", {
			type: "RuntimeDefault",
		}),
	);
};

export const applyScheduling = (
	workload: Workload,
	selectors: Record<string, string>,
) => {
	workload.scheduling.attract(antiSpotAffinity);
	workload.scheduling.separate(workload, {
		topology: Topology.HOSTNAME,
		weight: 100,
	});
	workload.scheduling.separate(workload, {
		topology: Topology.ZONE,
		weight: 50,
	});

	ApiObject.of(workload).addJsonPatch(
		JsonPatch.add("/spec/template/spec/topologySpreadConstraints", [
			{
				maxSkew: 1,
				topologyKey: "topology.kubernetes.io/zone",
				whenUnsatisfiable: "ScheduleAnyway",
				labelSelector: { matchLabels: selectors },
			},
			{
				maxSkew: 1,
				topologyKey: "kubernetes.io/hostname",
				whenUnsatisfiable: "DoNotSchedule",
				labelSelector: { matchLabels: selectors },
			},
		]),
	);
};

export const dualStack = (service: ApiObject) => {
	service.addJsonPatch(
		JsonPatch.add("/spec/ipFamilyPolicy", "PreferDualStack"),
		JsonPatch.add("/spec/ipFamilies", ["IPv4", "IPv6"]),
	);
};

// ── Shared types ──────────────────────────────────────────────────────

export type BaseProps = {
	name: string;
	namespace: string;
	version: string;
	labels?: Record<string, string>;
};

type ProbeConfig = {
	path: string;
	port: number;
	scheme?: ConnectionScheme;
	initialDelaySeconds?: number;
	timeoutSeconds?: number;
	periodSeconds?: number;
	successThreshold?: number;
	failureThreshold?: number;
};

type PortConfig = {
	number: number;
	name: string;
	protocol?: Protocol;
};

type ResourceConfig = {
	limits: { cpu?: unknown; memory?: unknown };
	requests: { cpu?: unknown; memory?: unknown };
};

export type ResourceTier = "S" | "M" | "L" | "XL";

export const RESOURCE_TIERS: Record<ResourceTier, ResourceConfig> = {
	S: {
		requests: { cpu: Cpu.millis(50), memory: Size.mebibytes(128) },
		limits: { cpu: Cpu.millis(100), memory: Size.mebibytes(256) },
	},
	M: {
		requests: { cpu: Cpu.millis(200), memory: Size.mebibytes(512) },
		limits: { cpu: Cpu.millis(400), memory: Size.gibibytes(1) },
	},
	L: {
		requests: { cpu: Cpu.units(1), memory: Size.gibibytes(2) },
		limits: { cpu: Cpu.units(2), memory: Size.gibibytes(4) },
	},
	XL: {
		requests: { cpu: Cpu.units(4), memory: Size.gibibytes(8) },
		limits: { cpu: Cpu.units(8), memory: Size.gibibytes(16) },
	},
};

export type PullPolicy = "Always" | "IfNotPresent" | "Never";

export type PodSecurityContext = {
	runAsUser: number;
	runAsGroup: number;
	fsGroup: number;
	ensureNonRoot?: boolean;
};

type MetricsConfig = {
	port: number;
	path?: string;
	tlsSecretName: string;
	tlsMountPath?: string;
};

export type ContainerDef = {
	name: string;
	image: string;
	imagePullPolicy?: PullPolicy;
	command?: string[];
	args?: string[];
	ports?: PortConfig[];
	envVariables?: Record<string, EnvValue>;
	envFrom?: EnvFrom[];
	resources: ResourceConfig | ResourceTier;
	liveness?: ProbeConfig;
	readiness?: ProbeConfig;
	startup?: ProbeConfig;
	securityContext?: ReturnType<typeof hardenedContainer>;
	volumeMounts?: { volume: Volume; path: string; readOnly?: boolean }[];
	metrics?: MetricsConfig;
};

/** Scheduling-related fields shared by all workload def types. */
export type SchedulingFields = {
	priorityClassName?: string;
	terminationGracePeriodSeconds?: number;
	tolerations?: unknown[];
	nodeSelector?: Record<string, string>;
	affinity?: unknown;
	hostNetwork?: boolean;
	extraPatches?: JsonPatch[];
};

/** Common fields shared by all workload definition types. */
type WorkloadDefBase<
	P extends Record<string, unknown> = Record<string, unknown>,
> = {
	id: string;
	name: string;
	component?: string;
	serviceAccount?: IServiceAccount;
	automountServiceAccountToken?: boolean;
	podAnnotations?: Record<string, string>;
	podSecurityContext?: PodSecurityContext;
	containers: ContainerDef[];
	applyPodSeccomp?: boolean;
	applyScheduling?: boolean;
	when?: (props: BaseProps & P) => boolean;
} & SchedulingFields;

// ── Shared helpers ────────────────────────────────────────────────────

const buildSelectors = <P extends Record<string, unknown>>(
	def: { component?: string },
	props: BaseProps & P,
) =>
	def.component
		? componentLabels(props.name, def.component)
		: selectorLabels(props.name);

type WorkloadMeta = {
	selectors: Record<string, string>;
	labels: Record<string, string>;
};

const buildMetadata = <P extends Record<string, unknown>>(
	def: { component?: string },
	props: BaseProps & P,
): WorkloadMeta => ({
	selectors: buildSelectors(def, props),
	labels: {
		...commonLabels(props),
		...(def.component ? { "app.kubernetes.io/component": def.component } : {}),
	},
});

type PodSecurityContextOpts = {
	securityContext: {
		user: number | undefined;
		group: number | undefined;
		fsGroup: number | undefined;
		ensureNonRoot: boolean;
	};
};

const buildPodSecurityContext = (
	psc?: PodSecurityContext,
): Partial<PodSecurityContextOpts> =>
	psc
		? {
				securityContext: {
					user: psc.runAsUser,
					group: psc.runAsGroup,
					fsGroup: psc.fsGroup,
					ensureNonRoot: psc.ensureNonRoot ?? true,
				},
			}
		: {};

type PodMeta = {
	labels: Record<string, string>;
	annotations?: Record<string, string>;
};

const buildPodMetadata = (
	selectors: Record<string, string>,
	annotations?: Record<string, string>,
): PodMeta => ({
	labels: selectors,
	...(annotations ? { annotations } : {}),
});

type CommonWorkloadOpts = {
	serviceAccount?: IServiceAccount;
	automountServiceAccountToken?: boolean;
} & Partial<PodSecurityContextOpts>;

const buildCommonOpts = <P extends Record<string, unknown>>(
	def: WorkloadDefBase<P>,
): CommonWorkloadOpts => ({
	...(def.serviceAccount ? { serviceAccount: def.serviceAccount } : {}),
	...(def.automountServiceAccountToken !== undefined
		? { automountServiceAccountToken: def.automountServiceAccountToken }
		: {}),
	...buildPodSecurityContext(def.podSecurityContext),
});

/**
 * Generic workload construct factory. Eliminates the repeated loop/when/
 * labels/scheduling boilerplate shared by all 4 workload types.
 */
const defineWorkload = <
	W extends Construct,
	D extends WorkloadDefBase<P>,
	P extends Record<string, unknown> = Record<string, unknown>,
	StoreName extends string = string,
>(opts: {
	defs: (scope: Construct, props: BaseProps & P) => D[];
	create: (
		scope: Construct,
		def: D,
		props: BaseProps & P,
		meta: WorkloadMeta,
	) => W;
	postCreate?: (
		workload: W,
		def: D,
		props: BaseProps & P,
		selectors: Record<string, string>,
	) => void;
	applySchedulingByDefault?: boolean;
	skipPodSeccomp?: boolean;
	schedulingPath?: string;
	mapKey: (def: D) => string;
	storeName: StoreName;
}): (new (
	scope: Construct,
	id: string,
	props: BaseProps & P,
) => Construct & { [K in StoreName]: Map<string, W> }) => {
	const StoreKey = opts.storeName;
	class WorkloadConstruct extends Construct {
		constructor(scope: Construct, id: string, props: BaseProps & P) {
			super(scope, id);
			(this as Record<string, unknown>)[StoreKey] = new Map<string, W>();
			const store = (this as Record<string, unknown>)[StoreKey] as Map<
				string,
				W
			>;

			for (const def of opts.defs(this, props)) {
				if (def.when && !def.when(props)) continue;

				const meta = buildMetadata(def, props);
				const workload = opts.create(this, def, props, meta);

				if (opts.postCreate)
					opts.postCreate(workload, def, props, meta.selectors);

				if (
					def.applyScheduling !== false &&
					opts.applySchedulingByDefault !== false
				) {
					applyScheduling(workload as unknown as Workload, meta.selectors);
				}

				if (def.applyPodSeccomp !== false && !opts.skipPodSeccomp) {
					applyPodSeccomp(workload as unknown as Workload);
				}

				applySchedulingPatches(
					ApiObject.of(workload),
					opts.schedulingPath ?? "/spec/template/spec",
					def as unknown as SchedulingFields,
				);

				store.set(opts.mapKey(def), workload);
			}
		}
	}
	return WorkloadConstruct as new (
		scope: Construct,
		id: string,
		props: BaseProps & P,
	) => Construct & { [K in StoreName]: Map<string, W> };
};

export const resolvePullPolicy = (policy: PullPolicy): ImagePullPolicy =>
	policy === "Always"
		? ImagePullPolicy.ALWAYS
		: policy === "Never"
			? ImagePullPolicy.NEVER
			: ImagePullPolicy.IF_NOT_PRESENT;

const DEFAULT_PROBE_CONFIG: ProbeConfig = {
	path: "/healthz",
	port: 8080,
	scheme: ConnectionScheme.HTTP,
	initialDelaySeconds: 10,
	timeoutSeconds: 5,
	periodSeconds: 10,
	successThreshold: 1,
	failureThreshold: 3,
};

export const buildProbe = (config: ProbeConfig): Probe =>
	Probe.fromHttpGet(config.path, {
		port: config.port,
		scheme: config.scheme ?? ConnectionScheme.HTTP,
		...(config.initialDelaySeconds !== undefined
			? { initialDelaySeconds: Duration.seconds(config.initialDelaySeconds) }
			: {}),
		...(config.timeoutSeconds !== undefined
			? { timeoutSeconds: Duration.seconds(config.timeoutSeconds) }
			: {}),
		...(config.periodSeconds !== undefined
			? { periodSeconds: Duration.seconds(config.periodSeconds) }
			: {}),
		...(config.successThreshold !== undefined
			? { successThreshold: config.successThreshold }
			: {}),
		...(config.failureThreshold !== undefined
			? { failureThreshold: config.failureThreshold }
			: {}),
	});

const resolveResources = (
	resources: ResourceConfig | ResourceTier,
): ResourceConfig =>
	typeof resources === "string" ? RESOURCE_TIERS[resources] : resources;

export const buildResources = (
	resources: ResourceConfig | ResourceTier,
): ContainerProps["resources"] => {
	const config = resolveResources(resources);
	return {
		cpu: {
			limit: config.limits.cpu as never,
			request: config.requests.cpu as never,
		},
		memory: {
			limit: config.limits.memory as never,
			request: config.requests.memory as never,
		},
	};
};

export const buildPorts = (ports: PortConfig[]): ContainerProps["ports"] =>
	ports.map((p) => ({
		number: p.number,
		name: p.name,
		protocol: p.protocol ?? Protocol.TCP,
	}));

export const flagsToArgs = (
	flags: Record<string, string | boolean | number>,
): string[] =>
	Object.entries(flags)
		.filter(([, v]) => v !== false)
		.map(([k, v]) => (v === true ? `--${k}` : `--${k}=${v}`));

export const createMetricsVolume = (
	scope: Construct,
	secretName: string,
	mountPath = "/tls",
): {
	volume: Volume;
	mount: { volume: Volume; path: string; readOnly: true };
} => {
	const volume = Volume.fromSecret(
		scope,
		"tls-volume",
		Secret.fromSecretName(scope, "tls-secret", secretName),
	);
	return {
		volume,
		mount: { volume, path: mountPath, readOnly: true },
	};
};

export const resolveContainer = (def: ContainerDef): ContainerProps => {
	const ports = def.ports ? [...def.ports] : [];
	let liveness = def.liveness;

	if (def.metrics) {
		if (!ports.some((p) => p.number === def.metrics!.port)) {
			ports.push({ number: def.metrics.port, name: "https-metrics" });
		}
		if (!liveness) {
			liveness = {
				...DEFAULT_PROBE_CONFIG,
				path: def.metrics.path ?? "/healthz",
				port: def.metrics.port,
				scheme: ConnectionScheme.HTTPS,
			};
		}
	}

	return {
		name: def.name,
		image: def.image,
		...(def.imagePullPolicy
			? { imagePullPolicy: resolvePullPolicy(def.imagePullPolicy) }
			: {}),
		...(def.command ? { command: def.command } : {}),
		...(def.args ? { args: def.args } : {}),
		...(ports.length > 0 ? { ports: buildPorts(ports) } : {}),
		...(def.envVariables ? { envVariables: def.envVariables } : {}),
		...(def.envFrom ? { envFrom: def.envFrom } : {}),
		resources: buildResources(def.resources),
		...(liveness ? { liveness: buildProbe(liveness) } : {}),
		...(def.readiness ? { readiness: buildProbe(def.readiness) } : {}),
		...(def.startup ? { startup: buildProbe(def.startup) } : {}),
		...(def.securityContext ? { securityContext: def.securityContext } : {}),
		...(def.volumeMounts ? { volumeMounts: def.volumeMounts } : {}),
	};
};

/**
 * Applies scheduling-related fields (priorityClassName, tolerations, etc.)
 * to a workload's ApiObject via JsonPatch.
 *
 * @param obj - The ApiObject to patch (e.g. from `ApiObject.of(workload)`)
 * @param basePath - JSON path prefix to the pod spec (e.g. `/spec/template/spec`)
 * @param fields - Scheduling fields from the workload def
 */
export const applySchedulingPatches = (
	obj: ApiObject,
	basePath: string,
	fields: SchedulingFields,
) => {
	const jsonPatches: JsonPatch[] = [];

	if (fields.priorityClassName) {
		jsonPatches.push(
			JsonPatch.add(`${basePath}/priorityClassName`, fields.priorityClassName),
		);
	}
	if (fields.terminationGracePeriodSeconds !== undefined) {
		jsonPatches.push(
			JsonPatch.add(
				`${basePath}/terminationGracePeriodSeconds`,
				fields.terminationGracePeriodSeconds,
			),
		);
	}
	if (fields.hostNetwork) {
		jsonPatches.push(JsonPatch.add(`${basePath}/hostNetwork`, true));
	}
	if (fields.nodeSelector && Object.keys(fields.nodeSelector).length > 0) {
		jsonPatches.push(
			JsonPatch.add(`${basePath}/nodeSelector`, fields.nodeSelector),
		);
	}
	if (fields.tolerations && fields.tolerations.length > 0) {
		jsonPatches.push(
			JsonPatch.add(`${basePath}/tolerations`, fields.tolerations),
		);
	}
	if (fields.affinity) {
		jsonPatches.push(JsonPatch.add(`${basePath}/affinity`, fields.affinity));
	}
	if (fields.extraPatches) {
		jsonPatches.push(...fields.extraPatches);
	}

	if (jsonPatches.length > 0) {
		obj.addJsonPatch(...jsonPatches);
	}
};

// ── Deployment ────────────────────────────────────────────────────────

export type DeploymentDef<
	P extends Record<string, unknown> = Record<string, unknown>,
> = WorkloadDefBase<P> & {
	replicas: number;
	revisionHistoryLimit?: number;
	volumes?: Volume[];
};

export type DefineDeploymentOpts<
	P extends Record<string, unknown> = Record<string, unknown>,
> = {
	deployments: (scope: Construct, props: BaseProps & P) => DeploymentDef<P>[];
};

export const defineDeployment = <
	P extends Record<string, unknown> = Record<string, unknown>,
>(
	opts: DefineDeploymentOpts<P>,
) =>
	defineWorkload<Deployment, DeploymentDef<P>, P>({
		defs: opts.deployments,
		mapKey: (def) => def.name,
		storeName: "deployments",
		create: (scope, def, props, meta) =>
			new Deployment(scope, def.id, {
				metadata: {
					name: def.name,
					namespace: props.namespace,
					labels: meta.labels,
				},
				replicas: def.replicas,
				...(def.revisionHistoryLimit !== undefined
					? { revisionHistoryLimit: def.revisionHistoryLimit }
					: {}),
				strategy: rollingUpdate(),
				...buildCommonOpts(def),
				podMetadata: buildPodMetadata(meta.selectors, def.podAnnotations),
				containers: def.containers.map(resolveContainer),
				...(def.volumes ? { volumes: def.volumes } : {}),
			}),
	}) as unknown as new (
		scope: Construct,
		id: string,
		props: BaseProps & P,
	) => Construct & { deployments: Map<string, Deployment> };

// ── StatefulSet ───────────────────────────────────────────────────────

export type VolumeClaimTemplate = {
	name: string;
	size: string;
	storageClass?: string;
	labels?: Record<string, string>;
};

export type StatefulSetDef<
	P extends Record<string, unknown> = Record<string, unknown>,
> = WorkloadDefBase<P> & {
	replicas: number;
	serviceName: string;
	volumes?: unknown[];
	volumeClaimTemplates?: VolumeClaimTemplate[];
	podManagementPolicy?: "OrderedReady" | "Parallel";
	updateStrategy?: { type: "RollingUpdate" | "OnDelete" };
	revisionHistoryLimit?: number;
};

export type DefineStatefulSetOpts<
	P extends Record<string, unknown> = Record<string, unknown>,
> = {
	statefulSets: (scope: Construct, props: BaseProps & P) => StatefulSetDef<P>[];
};

export const defineStatefulSet = <
	P extends Record<string, unknown> = Record<string, unknown>,
>(
	opts: DefineStatefulSetOpts<P>,
) =>
	defineWorkload<StatefulSet, StatefulSetDef<P>, P>({
		defs: opts.statefulSets,
		mapKey: (def) => def.name,
		storeName: "statefulSets",
		create: (scope, def, props, meta) =>
			new StatefulSet(scope, def.id, {
				metadata: {
					name: def.name,
					namespace: props.namespace,
					labels: meta.labels,
				},
				replicas: def.replicas,
				...(def.revisionHistoryLimit !== undefined
					? { revisionHistoryLimit: def.revisionHistoryLimit }
					: {}),
				...buildCommonOpts(def),
				podMetadata: buildPodMetadata(meta.selectors, def.podAnnotations),
				containers: def.containers.map(resolveContainer),
			}),
		postCreate: (sts, def) => {
			const obj = ApiObject.of(sts);
			obj.addJsonPatch(JsonPatch.add("/spec/serviceName", def.serviceName));
			obj.addJsonPatch(
				JsonPatch.add(
					"/spec/podManagementPolicy",
					def.podManagementPolicy ?? "OrderedReady",
				),
			);
			obj.addJsonPatch(
				JsonPatch.add("/spec/updateStrategy", {
					type: def.updateStrategy?.type ?? "RollingUpdate",
				}),
			);
			if (def.volumes?.length) {
				obj.addJsonPatch(
					JsonPatch.add("/spec/template/spec/volumes", def.volumes),
				);
			}
			if (def.volumeClaimTemplates?.length) {
				obj.addJsonPatch(
					JsonPatch.add(
						"/spec/volumeClaimTemplates",
						def.volumeClaimTemplates.map((t) => ({
							metadata: {
								name: t.name,
								...(t.labels ? { labels: t.labels } : {}),
							},
							spec: {
								accessModes: ["ReadWriteOnce"],
								resources: {
									requests: {
										storage: Size.gibibytes(
											Number.parseInt(t.size, 10),
										).toKibibytes(),
									},
								},
								...(t.storageClass ? { storageClassName: t.storageClass } : {}),
							},
						})),
					),
				);
			}
		},
	}) as unknown as new (
		scope: Construct,
		id: string,
		props: BaseProps & P,
	) => Construct & { statefulSets: Map<string, StatefulSet> };

// ── DaemonSet ─────────────────────────────────────────────────────────

export type DaemonSetDef<
	P extends Record<string, unknown> = Record<string, unknown>,
> = WorkloadDefBase<P> & {
	volumes?: unknown[];
	updateStrategy?: {
		type: "RollingUpdate" | "OnDelete";
		maxUnavailable?: string;
	};
	minReadySeconds?: number;
	revisionHistoryLimit?: number;
};

export type DefineDaemonSetOpts<
	P extends Record<string, unknown> = Record<string, unknown>,
> = {
	daemonSets: (scope: Construct, props: BaseProps & P) => DaemonSetDef<P>[];
};

export const defineDaemonSet = <
	P extends Record<string, unknown> = Record<string, unknown>,
>(
	opts: DefineDaemonSetOpts<P>,
) =>
	defineWorkload<DaemonSet, DaemonSetDef<P>, P>({
		defs: opts.daemonSets,
		mapKey: (def) => def.name,
		storeName: "daemonSets",
		applySchedulingByDefault: false,
		create: (scope, def, props, meta) =>
			new DaemonSet(scope, def.id, {
				metadata: {
					name: def.name,
					namespace: props.namespace,
					labels: meta.labels,
				},
				...(def.revisionHistoryLimit !== undefined
					? { revisionHistoryLimit: def.revisionHistoryLimit }
					: {}),
				...buildCommonOpts(def),
				podMetadata: buildPodMetadata(meta.selectors, def.podAnnotations),
				containers: def.containers.map(resolveContainer),
			}),
		postCreate: (ds, def) => {
			const obj = ApiObject.of(ds);
			if (def.updateStrategy) {
				const strategy: Record<string, unknown> = {
					type: def.updateStrategy.type,
				};
				if (def.updateStrategy.maxUnavailable) {
					strategy.rollingUpdate = {
						maxUnavailable: def.updateStrategy.maxUnavailable,
					};
				}
				obj.addJsonPatch(JsonPatch.add("/spec/updateStrategy", strategy));
			}
			if (def.volumes?.length) {
				obj.addJsonPatch(
					JsonPatch.add("/spec/template/spec/volumes", def.volumes),
				);
			}
		},
	}) as unknown as new (
		scope: Construct,
		id: string,
		props: BaseProps & P,
	) => Construct & { daemonSets: Map<string, DaemonSet> };

// ── CronJob ───────────────────────────────────────────────────────────

export type CronJobDef<
	P extends Record<string, unknown> = Record<string, unknown>,
> = WorkloadDefBase<P> & {
	schedule: Cron;
	concurrencyPolicy?: "Allow" | "Forbid" | "Replace";
	successfulJobsHistoryLimit?: number;
	failedJobsHistoryLimit?: number;
	restartPolicy?: "Never" | "OnFailure";
	volumes?: unknown[];
};

export type DefineCronJobOpts<
	P extends Record<string, unknown> = Record<string, unknown>,
> = {
	cronJobs: (scope: Construct, props: BaseProps & P) => CronJobDef<P>[];
};

export const defineCronJob = <
	P extends Record<string, unknown> = Record<string, unknown>,
>(
	opts: DefineCronJobOpts<P>,
) =>
	defineWorkload<CronJob, CronJobDef<P>, P>({
		defs: opts.cronJobs,
		mapKey: (def) => def.name,
		storeName: "cronJobs",
		applySchedulingByDefault: false,
		skipPodSeccomp: true,
		schedulingPath: "/spec/jobTemplate/spec/template/spec",
		create: (scope, def, props, meta) =>
			new CronJob(scope, def.id, {
				metadata: {
					name: def.name,
					namespace: props.namespace,
					labels: meta.labels,
				},
				schedule: def.schedule,
				...(def.concurrencyPolicy
					? {
							concurrencyPolicy: {
								Allow: "Allow",
								Forbid: "Forbid",
								Replace: "Replace",
							}[def.concurrencyPolicy] as never,
						}
					: {}),
				...(def.successfulJobsHistoryLimit !== undefined
					? { successfulJobsRetained: def.successfulJobsHistoryLimit }
					: {}),
				...(def.failedJobsHistoryLimit !== undefined
					? { failedJobsRetained: def.failedJobsHistoryLimit }
					: {}),
				...buildCommonOpts(def),
				podMetadata: buildPodMetadata(meta.selectors, def.podAnnotations),
				containers: def.containers.map(resolveContainer),
			}),
		postCreate: (cj, def) => {
			const obj = ApiObject.of(cj);
			if (def.volumes?.length) {
				obj.addJsonPatch(
					JsonPatch.add(
						"/spec/jobTemplate/spec/template/spec/volumes",
						def.volumes,
					),
				);
			}
			if (def.applyPodSeccomp !== false) {
				obj.addJsonPatch(
					JsonPatch.add(
						"/spec/jobTemplate/spec/template/spec/securityContext/seccompProfile",
						{ type: "RuntimeDefault" },
					),
				);
			}
		},
	}) as unknown as new (
		scope: Construct,
		id: string,
		props: BaseProps & P,
	) => Construct & { cronJobs: Map<string, CronJob> };
