/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

export { FlinkBlueGreenDeployment } from "Data/Crds/Imports/flinkbluegreendeployment-flink.apache.org"; // v1beta1
export { FlinkDeployment } from "Data/Crds/Imports/flinkdeployment-flink.apache.org"; // v1beta1
export { FlinkSessionJob } from "Data/Crds/Imports/flinksessionjob-flink.apache.org"; // v1beta1
export { FlinkStateSnapshot } from "Data/Crds/Imports/flinkstatesnapshot-flink.apache.org"; // v1beta1
export { Kafka as StrimziKafka } from "Data/Crds/Imports/kafka-kafka.strimzi.io";
export { KafkaBridge as StrimziKafkaBridge } from "Data/Crds/Imports/kafkabridge-kafka.strimzi.io";
export { KafkaConnect as StrimziKafkaConnect } from "Data/Crds/Imports/kafkaconnect-kafka.strimzi.io";
export { KafkaConnector as StrimziKafkaConnector } from "Data/Crds/Imports/kafkaconnector-kafka.strimzi.io";
export { KafkaMirrorMaker2 as StrimziKafkaMirrorMaker2 } from "Data/Crds/Imports/kafkamirrormaker2-kafka.strimzi.io";
export { KafkaNodePool as StrimziKafkaNodePool } from "Data/Crds/Imports/kafkanodepool-kafka.strimzi.io";
export { KafkaRebalance as StrimziKafkaRebalance } from "Data/Crds/Imports/kafkarebalance-kafka.strimzi.io";
export { KafkaTopic as StrimziKafkaTopic } from "Data/Crds/Imports/kafkatopic-kafka.strimzi.io";
export { KafkaUser as StrimziKafkaUser } from "Data/Crds/Imports/kafkauser-kafka.strimzi.io";
export {
	NatsCluster, // v1alpha2
	NatsServiceRole, // v1alpha2
} from "Data/Crds/Imports/natscluster-nats.io";
export { StrimziPodSet } from "Data/Crds/Imports/strimzipodset-core.strimzi.io";
