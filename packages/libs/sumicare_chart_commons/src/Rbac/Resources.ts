/**
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { ApiResource } from "cdk8s-plus-33";

/**
 * Registry of well-known Kubernetes API resources from cdk8s-plus-33,
 * plus custom resources not in the built-in library (VPA, descheduler, etc.).
 *
 * Keys are used as `EndpointInput` string literals in RBAC rule definitions.
 */
export const K8S_RESOURCES = {
	pods: ApiResource.PODS,
	configMaps: ApiResource.CONFIG_MAPS,
	nodes: ApiResource.NODES,
	namespaces: ApiResource.NAMESPACES,
	events: ApiResource.EVENTS,
	services: ApiResource.SERVICES,
	secrets: ApiResource.SECRETS,
	serviceAccounts: ApiResource.SERVICE_ACCOUNTS,
	endpoints: ApiResource.ENDPOINTS,
	limitRanges: ApiResource.LIMIT_RANGES,
	persistentVolumes: ApiResource.PERSISTENT_VOLUMES,
	persistentVolumeClaims: ApiResource.PERSISTENT_VOLUME_CLAIMS,
	replicationControllers: ApiResource.REPLICATION_CONTROLLERS,
	// VPA custom resources
	vpaVerticalPodAutoscalers: ApiResource.custom({
		apiGroup: "autoscaling.k8s.io",
		resourceType: "verticalpodautoscalers",
	}),
	vpaPocVerticalPodAutoscalers: ApiResource.custom({
		apiGroup: "poc.autoscaling.k8s.io",
		resourceType: "verticalpodautoscalers",
	}),
	vpaCheckpoints: ApiResource.custom({
		apiGroup: "autoscaling.k8s.io",
		resourceType: "verticalpodautoscalercheckpoints",
	}),
	vpaPocCheckpoints: ApiResource.custom({
		apiGroup: "poc.autoscaling.k8s.io",
		resourceType: "verticalpodautoscalercheckpoints",
	}),
	vpaStatus: ApiResource.custom({
		apiGroup: "autoscaling.k8s.io",
		resourceType: "verticalpodautoscalers/status",
	}),
	podsEviction: ApiResource.custom({
		apiGroup: "",
		resourceType: "pods/eviction",
	}),
	appsReplicasets: ApiResource.custom({
		apiGroup: "apps",
		resourceType: "replicasets",
	}),
	extensionsReplicasets: ApiResource.custom({
		apiGroup: "extensions",
		resourceType: "replicasets",
	}),
	metricsPods: ApiResource.custom({
		apiGroup: "metrics.k8s.io",
		resourceType: "pods",
	}),
	podsResize: ApiResource.custom({
		apiGroup: "",
		resourceType: "pods/resize",
	}),
	scaleAll: ApiResource.custom({
		apiGroup: "*",
		resourceType: "*/scale",
	}),
	// Wildcard resources (all resources in an API group)
	appsAll: ApiResource.custom({
		apiGroup: "apps",
		resourceType: "*",
	}),
	// Argo Rollouts custom resource
	argoprojRollouts: ApiResource.custom({
		apiGroup: "argoproj.io",
		resourceType: "rollouts",
	}),
	// Descheduler custom resources
	eventsK8sIo: ApiResource.custom({
		apiGroup: "events.k8s.io",
		resourceType: "events",
	}),
	schedulingPriorityClasses: ApiResource.custom({
		apiGroup: "scheduling.k8s.io",
		resourceType: "priorityclasses",
	}),
	podTemplates: ApiResource.POD_TEMPLATES,
	resourceQuotas: ApiResource.RESOURCE_QUOTAS,
	componentStatuses: ApiResource.COMPONENT_STATUSES,
	bindings: ApiResource.BINDINGS,
	mutatingWebhookConfigurations: ApiResource.MUTATING_WEBHOOK_CONFIGURATIONS,
	validatingWebhookConfigurations:
		ApiResource.VALIDATING_WEBHOOK_CONFIGURATIONS,
	customResourceDefinitions: ApiResource.CUSTOM_RESOURCE_DEFINITIONS,
	apiServices: ApiResource.API_SERVICES,
	controllerRevisions: ApiResource.CONTROLLER_REVISIONS,
	daemonSets: ApiResource.DAEMON_SETS,
	deployments: ApiResource.DEPLOYMENTS,
	replicaSets: ApiResource.REPLICA_SETS,
	statefulSets: ApiResource.STATEFUL_SETS,
	tokenReviews: ApiResource.TOKEN_REVIEWS,
	localSubjectAccessReviews: ApiResource.LOCAL_SUBJECT_ACCESS_REVIEWS,
	selfSubjectAccessReviews: ApiResource.SELF_SUBJECT_ACCESS_REVIEWS,
	selfSubjectRulesReviews: ApiResource.SELF_SUBJECT_RULES_REVIEWS,
	subjectAccessReviews: ApiResource.SUBJECT_ACCESS_REVIEWS,
	horizontalPodAutoscalers: ApiResource.HORIZONTAL_POD_AUTOSCALERS,
	cronJobs: ApiResource.CRON_JOBS,
	jobs: ApiResource.JOBS,
	certificateSigningRequests: ApiResource.CERTIFICATE_SIGNING_REQUESTS,
	certificateSigningRequestsStatus: ApiResource.custom({
		apiGroup: "certificates.k8s.io",
		resourceType: "certificatesigningrequests/status",
	}),
	leases: ApiResource.LEASES,
	endpointSlices: ApiResource.ENDPOINT_SLICES,
	flowSchemas: ApiResource.FLOW_SCHEMAS,
	priorityLevelConfigurations: ApiResource.PRIORITY_LEVEL_CONFIGURATIONS,
	ingressClasses: ApiResource.INGRESS_CLASSES,
	ingresses: ApiResource.INGRESSES,
	networkPolicies: ApiResource.NETWORK_POLICIES,
	runtimeClasses: ApiResource.RUNTIME_CLASSES,
	podDisruptionBudgets: ApiResource.POD_DISRUPTION_BUDGETS,
	clusterRoleBindings: ApiResource.CLUSTER_ROLE_BINDINGS,
	clusterRoles: ApiResource.CLUSTER_ROLES,
	roleBindings: ApiResource.ROLE_BINDINGS,
	roles: ApiResource.ROLES,
	priorityClasses: ApiResource.PRIORITY_CLASSES,
	csiDrivers: ApiResource.CSI_DRIVERS,
	csiNodes: ApiResource.CSI_NODES,
	csiStorageCapacities: ApiResource.CSI_STORAGE_CAPACITIES,
	storageClasses: ApiResource.STORAGE_CLASSES,
	volumeAttachments: ApiResource.VOLUME_ATTACHMENTS,
	// Standard subresources
	configMapsStatus: ApiResource.custom({
		apiGroup: "",
		resourceType: "configmaps/status",
	}),
	allResources: ApiResource.custom({
		apiGroup: "*",
		resourceType: "*",
	}),
	deploymentsScale: ApiResource.custom({
		apiGroup: "apps",
		resourceType: "deployments/scale",
	}),
	statefulSetsScale: ApiResource.custom({
		apiGroup: "apps",
		resourceType: "statefulsets/scale",
	}),
	// KEDA custom resources (keda.sh)
	kedaScaledObjects: ApiResource.custom({
		apiGroup: "keda.sh",
		resourceType: "scaledobjects",
	}),
	kedaScaledObjectsFinalizers: ApiResource.custom({
		apiGroup: "keda.sh",
		resourceType: "scaledobjects/finalizers",
	}),
	kedaScaledObjectsStatus: ApiResource.custom({
		apiGroup: "keda.sh",
		resourceType: "scaledobjects/status",
	}),
	kedaScaledJobs: ApiResource.custom({
		apiGroup: "keda.sh",
		resourceType: "scaledjobs",
	}),
	kedaScaledJobsFinalizers: ApiResource.custom({
		apiGroup: "keda.sh",
		resourceType: "scaledjobs/finalizers",
	}),
	kedaScaledJobsStatus: ApiResource.custom({
		apiGroup: "keda.sh",
		resourceType: "scaledjobs/status",
	}),
	kedaTriggerAuthentications: ApiResource.custom({
		apiGroup: "keda.sh",
		resourceType: "triggerauthentications",
	}),
	kedaTriggerAuthenticationsStatus: ApiResource.custom({
		apiGroup: "keda.sh",
		resourceType: "triggerauthentications/status",
	}),
	kedaClusterTriggerAuthentications: ApiResource.custom({
		apiGroup: "keda.sh",
		resourceType: "clustertriggerauthentications",
	}),
	kedaClusterTriggerAuthenticationsStatus: ApiResource.custom({
		apiGroup: "keda.sh",
		resourceType: "clustertriggerauthentications/status",
	}),
	// KEDA eventing resources (eventing.keda.sh)
	kedaCloudEventSources: ApiResource.custom({
		apiGroup: "eventing.keda.sh",
		resourceType: "cloudeventsources",
	}),
	kedaCloudEventSourcesStatus: ApiResource.custom({
		apiGroup: "eventing.keda.sh",
		resourceType: "cloudeventsources/status",
	}),
	kedaClusterCloudEventSources: ApiResource.custom({
		apiGroup: "eventing.keda.sh",
		resourceType: "clustercloudeventsources",
	}),
	kedaClusterCloudEventSourcesStatus: ApiResource.custom({
		apiGroup: "eventing.keda.sh",
		resourceType: "clustercloudeventsources/status",
	}),
	// KEDA external metrics
	kedaExternalMetrics: ApiResource.custom({
		apiGroup: "external.metrics.k8s.io",
		resourceType: "externalmetrics",
	}),
	// Kamaji custom resources (kamaji.clastix.io)
	kamajiDatastores: ApiResource.custom({
		apiGroup: "kamaji.clastix.io",
		resourceType: "datastores",
	}),
	kamajiDatastoresStatus: ApiResource.custom({
		apiGroup: "kamaji.clastix.io",
		resourceType: "datastores/status",
	}),
	kamajiTenantControlPlanes: ApiResource.custom({
		apiGroup: "kamaji.clastix.io",
		resourceType: "tenantcontrolplanes",
	}),
	kamajiTenantControlPlanesFinalizers: ApiResource.custom({
		apiGroup: "kamaji.clastix.io",
		resourceType: "tenantcontrolplanes/finalizers",
	}),
	kamajiTenantControlPlanesStatus: ApiResource.custom({
		apiGroup: "kamaji.clastix.io",
		resourceType: "tenantcontrolplanes/status",
	}),
	kamajiKubeconfigGenerators: ApiResource.custom({
		apiGroup: "kamaji.clastix.io",
		resourceType: "kubeconfiggenerators",
	}),
	kamajiKubeconfigGeneratorsStatus: ApiResource.custom({
		apiGroup: "kamaji.clastix.io",
		resourceType: "kubeconfiggenerators/status",
	}),
	kamajiKubeconfigGeneratorsFinalizers: ApiResource.custom({
		apiGroup: "kamaji.clastix.io",
		resourceType: "kubeconfiggenerators/finalizers",
	}),
	// Gateway API resources (gateway.networking.k8s.io)
	gatewayGateways: ApiResource.custom({
		apiGroup: "gateway.networking.k8s.io",
		resourceType: "gateways",
	}),
	gatewayGrpcRoutes: ApiResource.custom({
		apiGroup: "gateway.networking.k8s.io",
		resourceType: "grpcroutes",
	}),
	gatewayHttpRoutes: ApiResource.custom({
		apiGroup: "gateway.networking.k8s.io",
		resourceType: "httproutes",
	}),
	gatewayTlsRoutes: ApiResource.custom({
		apiGroup: "gateway.networking.k8s.io",
		resourceType: "tlsroutes",
	}),
	// Gateway API finalizers (gateway.networking.k8s.io)
	gatewayGatewaysFinalizers: ApiResource.custom({
		apiGroup: "gateway.networking.k8s.io",
		resourceType: "gateways/finalizers",
	}),
	gatewayHttpRoutesFinalizers: ApiResource.custom({
		apiGroup: "gateway.networking.k8s.io",
		resourceType: "httproutes/finalizers",
	}),
	gatewayListenerSets: ApiResource.custom({
		apiGroup: "gateway.networking.k8s.io",
		resourceType: "listenersets",
	}),
	gatewayListenerSetsFinalizers: ApiResource.custom({
		apiGroup: "gateway.networking.k8s.io",
		resourceType: "listenersets/finalizers",
	}),
	// Networking finalizers (networking.k8s.io)
	networkingIngressesFinalizers: ApiResource.custom({
		apiGroup: "networking.k8s.io",
		resourceType: "ingresses/finalizers",
	}),
	// cert-manager.io custom resources
	cmClusterIssuersFinalizers: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "clusterissuers/finalizers",
	}),
	cmIssuersFinalizers: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "issuers/finalizers",
	}),
	cmCertificates: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "certificates",
	}),
	cmCertificatesStatus: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "certificates/status",
	}),
	cmCertificatesFinalizers: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "certificates/finalizers",
	}),
	cmCertificateRequests: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "certificaterequests",
	}),
	cmCertificateRequestsStatus: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "certificaterequests/status",
	}),
	cmCertificateRequestsFinalizers: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "certificaterequests/finalizers",
	}),
	cmIssuers: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "issuers",
	}),
	cmIssuersStatus: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "issuers/status",
	}),
	cmClusterIssuers: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "clusterissuers",
	}),
	cmClusterIssuersStatus: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "clusterissuers/status",
	}),
	cmSigners: ApiResource.custom({
		apiGroup: "cert-manager.io",
		resourceType: "signers",
	}),
	// acme.cert-manager.io custom resources
	acmeOrders: ApiResource.custom({
		apiGroup: "acme.cert-manager.io",
		resourceType: "orders",
	}),
	acmeOrdersStatus: ApiResource.custom({
		apiGroup: "acme.cert-manager.io",
		resourceType: "orders/status",
	}),
	acmeOrdersFinalizers: ApiResource.custom({
		apiGroup: "acme.cert-manager.io",
		resourceType: "orders/finalizers",
	}),
	acmeChallenges: ApiResource.custom({
		apiGroup: "acme.cert-manager.io",
		resourceType: "challenges",
	}),
	acmeChallengesStatus: ApiResource.custom({
		apiGroup: "acme.cert-manager.io",
		resourceType: "challenges/status",
	}),
	acmeChallengesFinalizers: ApiResource.custom({
		apiGroup: "acme.cert-manager.io",
		resourceType: "challenges/finalizers",
	}),
	// certificates.k8s.io subresources
	certificatesK8sIoSigners: ApiResource.custom({
		apiGroup: "certificates.k8s.io",
		resourceType: "signers",
	}),
	// route.openshift.io custom resources
	openshiftRoutesCustomHost: ApiResource.custom({
		apiGroup: "route.openshift.io",
		resourceType: "routes/custom-host",
	}),
	// serviceaccounts/token subresource
	serviceAccountsToken: ApiResource.custom({
		apiGroup: "",
		resourceType: "serviceaccounts/token",
	}),
} as const;
