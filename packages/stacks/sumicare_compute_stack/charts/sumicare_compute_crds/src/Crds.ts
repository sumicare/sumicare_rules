/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

export { CloudEventSource as KedaCloudEventSource } from "Compute/Crds/Imports/cloudeventsource-eventing.keda.sh"; // v1alpha1
export { ClusterCloudEventSource as KedaClusterCloudEventSource } from "Compute/Crds/Imports/clustercloudeventsource-eventing.keda.sh"; // v1alpha1
export { ClusterTriggerAuthentication as KedaClusterTriggerAuthentication } from "Compute/Crds/Imports/clustertriggerauthentication-keda.sh"; // v1alpha1
export { DataStore as KamajiDataStore } from "Compute/Crds/Imports/datastore-kamaji.clastix.io"; // v1alpha1
export { KubeconfigGenerator as KamajiKubeconfigGenerator } from "Compute/Crds/Imports/kubeconfiggenerator-kamaji.clastix.io"; // v1alpha1
export { ScaledJob as KedaScaledJob } from "Compute/Crds/Imports/scaledjob-keda.sh"; // v1alpha1
export { ScaledObject as KedaScaledObject } from "Compute/Crds/Imports/scaledobject-keda.sh"; // v1alpha1
export { TenantControlPlane as KamajiTenantControlPlane } from "Compute/Crds/Imports/tenantcontrolplane-kamaji.clastix.io"; // v1alpha1
export { TriggerAuthentication as KedaTriggerAuthentication } from "Compute/Crds/Imports/triggerauthentication-keda.sh"; // v1alpha1
export {
	VerticalPodAutoscaler as VpaVerticalPodAutoscaler,
	VerticalPodAutoscalerCheckpoint as VpaVerticalPodAutoscalerCheckpoint,
} from "Compute/Crds/Imports/verticalpodautoscaler-autoscaling.k8s.io";
