/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { GithubUpstreamSource } from "@sumicare/chart-commons";
import { defineCrdSources } from "@sumicare/chart-commons";

const gatewayApi = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kubernetes-sigs", repo: "gateway-api" },
	path: "config/crd/standard",
	upstreamFile,
});

const inferenceExt = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kubernetes-sigs", repo: "gateway-api-inference-extension" },
	path: "config/crd/bases",
	upstreamFile,
});

const istio = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "istio", repo: "istio" },
	path: "manifests/charts/base/files",
	branch: "master",
	upstreamFile,
});

const externalDns = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kubernetes-sigs", repo: "external-dns" },
	path: "charts/external-dns/crds",
	branch: "master",
	upstreamFile,
});

const kgateway = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kgateway-dev", repo: "kgateway" },
	path: "install/helm/kgateway-crds/templates",
	upstreamFile,
});

const cilium = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "cilium", repo: "cilium" },
	path: "pkg/k8s/apis/cilium.io/client/crds/v2",
	upstreamFile,
});

const netbird = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "netbirdio", repo: "kubernetes-operator" },
	path: "charts/netbird-operator/crds",
	branch: "main",
	upstreamFile,
});

/** Single source of truth for all Networking CRD kinds, groups, and upstream sources. */
export const CRD_SOURCES = defineCrdSources({
	kinds: {
		backendtlspolicies: {
			file: "crd-gateway-api-backendtlspolicies.yaml",
			disableKey: "disableBackendTlsPolicies",
			description: "Disable BackendTLSPolicy CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_backendtlspolicies.yaml"),
		},
		gatewayclasses: {
			file: "crd-gateway-api-gatewayclasses.yaml",
			disableKey: "disableGatewayClasses",
			description: "Disable GatewayClass CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_gatewayclasses.yaml"),
		},
		gateways: {
			file: "crd-gateway-api-gateways.yaml",
			disableKey: "disableGateways",
			description: "Disable Gateway CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_gateways.yaml"),
		},
		grpcroutes: {
			file: "crd-gateway-api-grpcroutes.yaml",
			disableKey: "disableGrpcRoutes",
			description: "Disable GRPCRoute CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_grpcroutes.yaml"),
		},
		httproutes: {
			file: "crd-gateway-api-httproutes.yaml",
			disableKey: "disableHttpRoutes",
			description: "Disable HTTPRoute CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_httproutes.yaml"),
		},
		listenersets: {
			file: "crd-gateway-api-listenersets.yaml",
			disableKey: "disableListenerSets",
			description: "Disable ListenerSet CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_listenersets.yaml"),
		},
		referencegrants: {
			file: "crd-gateway-api-referencegrants.yaml",
			disableKey: "disableReferenceGrants",
			description: "Disable ReferenceGrant CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_referencegrants.yaml"),
		},
		tcproutes: {
			file: "crd-gateway-api-tcproutes.yaml",
			disableKey: "disableTcpRoutes",
			description: "Disable TCPRoute CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_tcproutes.yaml"),
		},
		tlsroutes: {
			file: "crd-gateway-api-tlsroutes.yaml",
			disableKey: "disableTlsRoutes",
			description: "Disable TLSRoute CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_tlsroutes.yaml"),
		},
		udproutes: {
			file: "crd-gateway-api-udproutes.yaml",
			disableKey: "disableUdpRoutes",
			description: "Disable UDPRoute CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_udproutes.yaml"),
		},
		vapsafeupgrades: {
			file: "crd-gateway-api-vap-safeupgrades.yaml",
			disableKey: "disableVapSafeUpgrades",
			description: "Disable VapSafeUpgrade CRD",
			upstream: gatewayApi("gateway.networking.k8s.io_vap_safeupgrades.yaml"),
		},
		inferencepools: {
			file: "crd-inference-ext-inferencepools.yaml",
			disableKey: "disableInferencePools",
			description: "Disable InferencePool CRD",
			upstream: inferenceExt("inference.networking.k8s.io_inferencepools.yaml"),
		},
		inferencepoolimports: {
			file: "crd-inference-ext-inferencepoolimports.yaml",
			disableKey: "disableInferencePoolImports",
			description: "Disable InferencePoolImport CRD",
			upstream: inferenceExt(
				"inference.networking.x-k8s.io_inferencepoolimports.yaml",
			),
		},
		istio: {
			file: "crd-istio-all.yaml",
			disableKey: "disableIstio",
			description: "Disable Istio CRDs",
			upstream: istio("crd-all.gen.yaml"),
		},
		dnsendpoints: {
			file: "crd-external-dns-dnsendpoints.yaml",
			disableKey: "disableDnsEndpoints",
			description: "Disable DNSEndpoint CRD",
			upstream: externalDns("dnsendpoints.externaldns.k8s.io.yaml"),
		},
		backendconfigpolicies: {
			file: "crd-kgateway-backendconfigpolicies.yaml",
			disableKey: "disableBackendConfigPolicies",
			description: "Disable BackendConfigPolicy CRD",
			upstream: kgateway("gateway.kgateway.dev_backendconfigpolicies.yaml"),
		},
		backends: {
			file: "crd-kgateway-backends.yaml",
			disableKey: "disableBackends",
			description: "Disable Backend CRD",
			upstream: kgateway("gateway.kgateway.dev_backends.yaml"),
		},
		directresponses: {
			file: "crd-kgateway-directresponses.yaml",
			disableKey: "disableDirectResponses",
			description: "Disable DirectResponse CRD",
			upstream: kgateway("gateway.kgateway.dev_directresponses.yaml"),
		},
		gatewayextensions: {
			file: "crd-kgateway-gatewayextensions.yaml",
			disableKey: "disableGatewayExtensions",
			description: "Disable GatewayExtension CRD",
			upstream: kgateway("gateway.kgateway.dev_gatewayextensions.yaml"),
		},
		gatewayparameters: {
			file: "crd-kgateway-gatewayparameters.yaml",
			disableKey: "disableGatewayParameters",
			description: "Disable GatewayParameter CRD",
			upstream: kgateway("gateway.kgateway.dev_gatewayparameters.yaml"),
		},
		httplistenerpolicies: {
			file: "crd-kgateway-httplistenerpolicies.yaml",
			disableKey: "disableHttpListenerPolicies",
			description: "Disable HttpListenerPolicy CRD",
			upstream: kgateway("gateway.kgateway.dev_httplistenerpolicies.yaml"),
		},
		listenerpolicies: {
			file: "crd-kgateway-listenerpolicies.yaml",
			disableKey: "disableListenerPolicies",
			description: "Disable ListenerPolicy CRD",
			upstream: kgateway("gateway.kgateway.dev_listenerpolicies.yaml"),
		},
		trafficpolicies: {
			file: "crd-kgateway-trafficpolicies.yaml",
			disableKey: "disableTrafficPolicies",
			description: "Disable TrafficPolicy CRD",
			upstream: kgateway("gateway.kgateway.dev_trafficpolicies.yaml"),
		},
		ciliumbgpadvertisements: {
			file: "crd-cilium-bgpadvertisements.yaml",
			disableKey: "disableCiliumBgpAdvertisements",
			description: "Disable CiliumBGPAdvertisement CRD",
			upstream: cilium("ciliumbgpadvertisements.yaml"),
		},
		ciliumbgpclusterconfigs: {
			file: "crd-cilium-bgpclusterconfigs.yaml",
			disableKey: "disableCiliumBgpClusterConfigs",
			description: "Disable CiliumBGPClusterConfig CRD",
			upstream: cilium("ciliumbgpclusterconfigs.yaml"),
		},
		ciliumbgpnodeconfigoverrides: {
			file: "crd-cilium-bgpnodeconfigoverrides.yaml",
			disableKey: "disableCiliumBgpNodeConfigOverrides",
			description: "Disable CiliumBGPNodeConfigOverride CRD",
			upstream: cilium("ciliumbgpnodeconfigoverrides.yaml"),
		},
		ciliumbgpnodeconfigs: {
			file: "crd-cilium-bgpnodeconfigs.yaml",
			disableKey: "disableCiliumBgpNodeConfigs",
			description: "Disable CiliumBGPNodeConfig CRD",
			upstream: cilium("ciliumbgpnodeconfigs.yaml"),
		},
		ciliumbgppeerconfigs: {
			file: "crd-cilium-bgppeerconfigs.yaml",
			disableKey: "disableCiliumBgpPeerConfigs",
			description: "Disable CiliumBGPPeerConfig CRD",
			upstream: cilium("ciliumbgppeerconfigs.yaml"),
		},
		ciliumcidrgroups: {
			file: "crd-cilium-cidrgroups.yaml",
			disableKey: "disableCiliumCidrGroups",
			description: "Disable CiliumCIDRGroup CRD",
			upstream: cilium("ciliumcidrgroups.yaml"),
		},
		ciliumclusterwideenvoyconfigs: {
			file: "crd-cilium-clusterwideenvoyconfigs.yaml",
			disableKey: "disableCiliumClusterwideEnvoyConfigs",
			description: "Disable CiliumClusterwideEnvoyConfig CRD",
			upstream: cilium("ciliumclusterwideenvoyconfigs.yaml"),
		},
		ciliumclusterwidenetworkpolicies: {
			file: "crd-cilium-clusterwidenetworkpolicies.yaml",
			disableKey: "disableCiliumClusterwideNetworkPolicies",
			description: "Disable CiliumClusterwideNetworkPolicy CRD",
			upstream: cilium("ciliumclusterwidenetworkpolicies.yaml"),
		},
		ciliumegressgatewaypolicies: {
			file: "crd-cilium-egressgatewaypolicies.yaml",
			disableKey: "disableCiliumEgressGatewayPolicies",
			description: "Disable CiliumEgressGatewayPolicy CRD",
			upstream: cilium("ciliumegressgatewaypolicies.yaml"),
		},
		ciliumendpoints: {
			file: "crd-cilium-endpoints.yaml",
			disableKey: "disableCiliumEndpoints",
			description: "Disable CiliumEndpoint CRD",
			upstream: cilium("ciliumendpoints.yaml"),
		},
		ciliumenvoyconfigs: {
			file: "crd-cilium-envoyconfigs.yaml",
			disableKey: "disableCiliumEnvoyConfigs",
			description: "Disable CiliumEnvoyConfig CRD",
			upstream: cilium("ciliumenvoyconfigs.yaml"),
		},
		ciliumidentities: {
			file: "crd-cilium-identities.yaml",
			disableKey: "disableCiliumIdentities",
			description: "Disable CiliumIdentity CRD",
			upstream: cilium("ciliumidentities.yaml"),
		},
		ciliumloadbalancerippools: {
			file: "crd-cilium-loadbalancerippools.yaml",
			disableKey: "disableCiliumLoadBalancerIpPools",
			description: "Disable CiliumLoadBalancerIPPool CRD",
			upstream: cilium("ciliumloadbalancerippools.yaml"),
		},
		ciliumlocalredirectpolicies: {
			file: "crd-cilium-localredirectpolicies.yaml",
			disableKey: "disableCiliumLocalRedirectPolicies",
			description: "Disable CiliumLocalRedirectPolicy CRD",
			upstream: cilium("ciliumlocalredirectpolicies.yaml"),
		},
		ciliumnetworkpolicies: {
			file: "crd-cilium-networkpolicies.yaml",
			disableKey: "disableCiliumNetworkPolicies",
			description: "Disable CiliumNetworkPolicy CRD",
			upstream: cilium("ciliumnetworkpolicies.yaml"),
		},
		ciliumnodeconfigs: {
			file: "crd-cilium-nodeconfigs.yaml",
			disableKey: "disableCiliumNodeConfigs",
			description: "Disable CiliumNodeConfig CRD",
			upstream: cilium("ciliumnodeconfigs.yaml"),
		},
		ciliumnodes: {
			file: "crd-cilium-nodes.yaml",
			disableKey: "disableCiliumNodes",
			description: "Disable CiliumNode CRD",
			upstream: cilium("ciliumnodes.yaml"),
		},
		clusterproxies: {
			file: "crd-netbird-clusterproxies.yaml",
			disableKey: "disableClusterProxies",
			description: "Disable ClusterProxy CRD",
			upstream: netbird("netbird.io_clusterproxies.yaml"),
		},
		nbgroups: {
			file: "crd-netbird-nbgroups.yaml",
			disableKey: "disableNbGroups",
			description: "Disable NbGroup CRD",
			upstream: netbird("netbird.io_nbgroups.yaml"),
		},
		nbpolicies: {
			file: "crd-netbird-nbpolicies.yaml",
			disableKey: "disableNbPolicies",
			description: "Disable NbPolicy CRD",
			upstream: netbird("netbird.io_nbpolicies.yaml"),
		},
		nbresources: {
			file: "crd-netbird-nbresources.yaml",
			disableKey: "disableNbResources",
			description: "Disable NbResource CRD",
			upstream: netbird("netbird.io_nbresources.yaml"),
		},
		nbroutingpeers: {
			file: "crd-netbird-nbroutingpeers.yaml",
			disableKey: "disableNbRoutingPeers",
			description: "Disable NbRoutingPeer CRD",
			upstream: netbird("netbird.io_nbroutingpeers.yaml"),
		},
		nbsetupkeys: {
			file: "crd-netbird-nbsetupkeys.yaml",
			disableKey: "disableNbSetupKeys",
			description: "Disable NbSetupKey CRD",
			upstream: netbird("netbird.io_nbsetupkeys.yaml"),
		},
		networkegresses: {
			file: "crd-netbird-networkegresses.yaml",
			disableKey: "disableNetworkEgresses",
			description: "Disable NetworkEgress CRD",
			upstream: netbird("netbird.io_networkegresses.yaml"),
		},
		networkresources: {
			file: "crd-netbird-networkresources.yaml",
			disableKey: "disableNetworkResources",
			description: "Disable NetworkResource CRD",
			upstream: netbird("netbird.io_networkresources.yaml"),
		},
		networkrouters: {
			file: "crd-netbird-networkrouters.yaml",
			disableKey: "disableNetworkRouters",
			description: "Disable NetworkRouter CRD",
			upstream: netbird("netbird.io_networkrouters.yaml"),
		},
		setupkeys: {
			file: "crd-netbird-setupkeys.yaml",
			disableKey: "disableSetupKeys",
			description: "Disable SetupKey CRD",
			upstream: netbird("netbird.io_setupkeys.yaml"),
		},
		sidecarprofiles: {
			file: "crd-netbird-sidecarprofiles.yaml",
			disableKey: "disableSidecarProfiles",
			description: "Disable SidecarProfile CRD",
			upstream: netbird("netbird.io_sidecarprofiles.yaml"),
		},
	},
	groups: {
		gatewayapi: {
			kinds: [
				"backendtlspolicies",
				"gatewayclasses",
				"gateways",
				"grpcroutes",
				"httproutes",
				"listenersets",
				"referencegrants",
				"tcproutes",
				"tlsroutes",
				"udproutes",
				"vapsafeupgrades",
			],
			disableKey: "disableGatewayApi",
			description: "Disable all Gateway API CRDs",
		},
		inferenceext: {
			kinds: ["inferencepools", "inferencepoolimports"],
			disableKey: "disableInferenceExt",
			description: "Disable all Gateway API Inference Extension CRDs",
		},
		istio: {
			kinds: ["istio"],
			disableKey: "disableIstioGroup",
			description: "Disable all Istio CRDs",
		},
		externaldns: {
			kinds: ["dnsendpoints"],
			disableKey: "disableExternalDns",
			description: "Disable all External DNS CRDs",
		},
		kgateway: {
			kinds: [
				"backendconfigpolicies",
				"backends",
				"directresponses",
				"gatewayextensions",
				"gatewayparameters",
				"httplistenerpolicies",
				"listenerpolicies",
				"trafficpolicies",
			],
			disableKey: "disableKgateway",
			description: "Disable all KGateway CRDs",
		},
		cilium: {
			kinds: [
				"ciliumbgpadvertisements",
				"ciliumbgpclusterconfigs",
				"ciliumbgpnodeconfigoverrides",
				"ciliumbgpnodeconfigs",
				"ciliumbgppeerconfigs",
				"ciliumcidrgroups",
				"ciliumclusterwideenvoyconfigs",
				"ciliumclusterwidenetworkpolicies",
				"ciliumegressgatewaypolicies",
				"ciliumendpoints",
				"ciliumenvoyconfigs",
				"ciliumidentities",
				"ciliumloadbalancerippools",
				"ciliumlocalredirectpolicies",
				"ciliumnetworkpolicies",
				"ciliumnodeconfigs",
				"ciliumnodes",
			],
			disableKey: "disableCilium",
			description: "Disable all Cilium CRDs",
		},
		netbird: {
			kinds: [
				"clusterproxies",
				"nbgroups",
				"nbpolicies",
				"nbresources",
				"nbroutingpeers",
				"nbsetupkeys",
				"networkegresses",
				"networkresources",
				"networkrouters",
				"setupkeys",
				"sidecarprofiles",
			],
			disableKey: "disableNetbird",
			description: "Disable all Netbird CRDs",
		},
	},
});
