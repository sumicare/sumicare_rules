/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

export { Backend as KgatewayBackend } from "Networking/Crds/Imports/backend-gateway.kgateway.dev";
export { BackendConfigPolicy as KgatewayBackendConfigPolicy } from "Networking/Crds/Imports/backendconfigpolicy-gateway.kgateway.dev";
export { BackendTlsPolicy as GatewayApiBackendTlsPolicy } from "Networking/Crds/Imports/backendtlspolicy-gateway.networking.k8s.io";
export { CiliumBgpAdvertisement } from "Networking/Crds/Imports/ciliumbgpadvertisement-cilium.io";
export { CiliumBgpClusterConfig } from "Networking/Crds/Imports/ciliumbgpclusterconfig-cilium.io";
export { CiliumBgpNodeConfig } from "Networking/Crds/Imports/ciliumbgpnodeconfig-cilium.io";
export { CiliumBgpNodeConfigOverride } from "Networking/Crds/Imports/ciliumbgpnodeconfigoverride-cilium.io";
export { CiliumBgpPeerConfig } from "Networking/Crds/Imports/ciliumbgppeerconfig-cilium.io";
export { CiliumCidrGroup } from "Networking/Crds/Imports/ciliumcidrgroup-cilium.io";
export { CiliumClusterwideEnvoyConfig } from "Networking/Crds/Imports/ciliumclusterwideenvoyconfig-cilium.io";
export { CiliumClusterwideNetworkPolicy } from "Networking/Crds/Imports/ciliumclusterwidenetworkpolicy-cilium.io";
export { CiliumEgressGatewayPolicy } from "Networking/Crds/Imports/ciliumegressgatewaypolicy-cilium.io";
export { CiliumEndpoint } from "Networking/Crds/Imports/ciliumendpoint-cilium.io";
export { CiliumEnvoyConfig } from "Networking/Crds/Imports/ciliumenvoyconfig-cilium.io";
export { CiliumIdentity } from "Networking/Crds/Imports/ciliumidentity-cilium.io";
export { CiliumLoadBalancerIpPool } from "Networking/Crds/Imports/ciliumloadbalancerippool-cilium.io";
export { CiliumLocalRedirectPolicy } from "Networking/Crds/Imports/ciliumlocalredirectpolicy-cilium.io";
export {
	CiliumNetworkPolicy,
	type CiliumNetworkPolicySpec,
	type CiliumNetworkPolicySpecEgress as CiliumNetworkPolicyEgress,
	type CiliumNetworkPolicySpecEgressToEntities as CiliumNetworkPolicyEgressToEntities,
	type CiliumNetworkPolicySpecEgressToPortsPortsProtocol as CiliumNetworkPolicyEgressToPortsPortsProtocol,
	type CiliumNetworkPolicySpecIngress as CiliumNetworkPolicyIngress,
	type CiliumNetworkPolicySpecIngressFromEntities as CiliumNetworkPolicyIngressFromEntities,
	type CiliumNetworkPolicySpecIngressToPortsPortsProtocol as CiliumNetworkPolicyIngressToPortsPortsProtocol,
} from "Networking/Crds/Imports/ciliumnetworkpolicy-cilium.io";
export { CiliumNode } from "Networking/Crds/Imports/ciliumnode-cilium.io";
export { CiliumNodeConfig } from "Networking/Crds/Imports/ciliumnodeconfig-cilium.io";
export { ClusterProxy as NetbirdClusterProxy } from "Networking/Crds/Imports/clusterproxy-netbird.io";
export { DirectResponse as KgatewayDirectResponse } from "Networking/Crds/Imports/directresponse-gateway.kgateway.dev";
export { DnsEndpoint as ExternalDnsDnsEndpoint } from "Networking/Crds/Imports/dnsendpoint-externaldns.k8s.io";
export {
	Gateway as GatewayApiGateway,
	type GatewaySpec as GatewayApiGatewaySpec,
	type GatewaySpecListeners as GatewayApiGatewayListeners,
} from "Networking/Crds/Imports/gateway-gateway.networking.k8s.io";
export { GatewayClass as GatewayApiGatewayClass } from "Networking/Crds/Imports/gatewayclass-gateway.networking.k8s.io";
export {
	GatewayExtension as KgatewayGatewayExtension,
	type GatewayExtensionSpec as KgatewayGatewayExtensionSpec,
	type GatewayExtensionSpecOauth2 as KgatewayGatewayExtensionOauth2,
} from "Networking/Crds/Imports/gatewayextension-gateway.kgateway.dev";
export { GatewayParameters as KgatewayGatewayParameters } from "Networking/Crds/Imports/gatewayparameter-gateway.kgateway.dev";
export { GrpcRoute as GatewayApiGrpcRoute } from "Networking/Crds/Imports/grpcroute-gateway.networking.k8s.io";
export { HttpListenerPolicy as KgatewayHttpListenerPolicy } from "Networking/Crds/Imports/httplistenerpolicy-gateway.kgateway.dev";
export { HttpRoute as GatewayApiHttpRoute } from "Networking/Crds/Imports/httproute-gateway.networking.k8s.io";
export { InferencePool as InferenceExtInferencePool } from "Networking/Crds/Imports/inferencepool-inference.networking.k8s.io";
export { InferencePoolImport as InferenceExtInferencePoolImport } from "Networking/Crds/Imports/inferencepoolimport-inference.networking.x-k8s.io";
export {
	TrafficExtension as IstioTrafficExtension,
	WasmPlugin as IstioWasmPlugin,
} from "Networking/Crds/Imports/istio-extensions.istio.io";
export {
	DestinationRule as IstioDestinationRule,
	type DestinationRuleSpec as IstioDestinationRuleSpec,
	EnvoyFilter as IstioEnvoyFilter,
	Gateway as IstioGateway,
	ProxyConfig as IstioProxyConfig,
	ServiceEntry as IstioServiceEntry,
	Sidecar as IstioSidecar,
	VirtualService as IstioVirtualService,
	WorkloadEntry as IstioWorkloadEntry,
	WorkloadGroup as IstioWorkloadGroup,
} from "Networking/Crds/Imports/istio-networking.istio.io";
export {
	AuthorizationPolicy as IstioAuthorizationPolicy,
	type AuthorizationPolicySpec as IstioAuthorizationPolicySpec,
	type AuthorizationPolicySpecAction as IstioAuthorizationPolicyAction,
	type AuthorizationPolicySpecRules as IstioAuthorizationPolicyRules,
	type AuthorizationPolicySpecRulesFrom as IstioAuthorizationPolicyRulesFrom,
	type AuthorizationPolicySpecRulesWhen as IstioAuthorizationPolicyRulesWhen,
	PeerAuthentication as IstioPeerAuthentication,
	type PeerAuthenticationSpec as IstioPeerAuthenticationSpec,
	RequestAuthentication as IstioRequestAuthentication,
	type RequestAuthenticationSpec as IstioRequestAuthenticationSpec,
	type RequestAuthenticationSpecJwtRules as IstioRequestAuthenticationJwtRules,
} from "Networking/Crds/Imports/istio-security.istio.io";
export { Telemetry as IstioTelemetry } from "Networking/Crds/Imports/istio-telemetry.istio.io";
export { ListenerPolicy as KgatewayListenerPolicy } from "Networking/Crds/Imports/listenerpolicy-gateway.kgateway.dev";
export { ListenerSet as GatewayApiListenerSet } from "Networking/Crds/Imports/listenerset-gateway.networking.k8s.io";
export { NbGroup as NetbirdNbGroup } from "Networking/Crds/Imports/nbgroup-netbird.io";
export { NbPolicy as NetbirdNbPolicy } from "Networking/Crds/Imports/nbpolicy-netbird.io";
export { NbResource as NetbirdNbResource } from "Networking/Crds/Imports/nbresource-netbird.io";
export { NbRoutingPeer as NetbirdNbRoutingPeer } from "Networking/Crds/Imports/nbroutingpeer-netbird.io";
export { NbSetupKey as NetbirdNbSetupKey } from "Networking/Crds/Imports/nbsetupkey-netbird.io";
export { NetworkEgress as NetbirdNetworkEgress } from "Networking/Crds/Imports/networkegress-netbird.io";
export {
	NetworkResource as NetbirdNetworkResource,
	type NetworkResourceSpec as NetbirdNetworkResourceSpec,
} from "Networking/Crds/Imports/networkresource-netbird.io";
export { NetworkRouter as NetbirdNetworkRouter } from "Networking/Crds/Imports/networkrouter-netbird.io";
export { ReferenceGrant as GatewayApiReferenceGrant } from "Networking/Crds/Imports/referencegrant-gateway.networking.k8s.io";
export { SetupKey as NetbirdSetupKey } from "Networking/Crds/Imports/setupkey-netbird.io";
export { SidecarProfile as NetbirdSidecarProfile } from "Networking/Crds/Imports/sidecarprofile-netbird.io";
export { TcpRoute as GatewayApiTcpRoute } from "Networking/Crds/Imports/tcproute-gateway.networking.k8s.io";
export { TlsRoute as GatewayApiTlsRoute } from "Networking/Crds/Imports/tlsroute-gateway.networking.k8s.io";
export { TrafficPolicy as KgatewayTrafficPolicy } from "Networking/Crds/Imports/trafficpolicy-gateway.kgateway.dev";
export { UdpRoute as GatewayApiUdpRoute } from "Networking/Crds/Imports/udproute-gateway.networking.k8s.io";
