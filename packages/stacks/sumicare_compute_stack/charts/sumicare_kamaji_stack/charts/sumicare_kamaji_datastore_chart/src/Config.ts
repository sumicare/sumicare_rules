/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestKamajiDataStoreVersion } from "Kamaji/DataStore/Version";
import { defineConfig, type InferConfig } from "@sumicare/chart-commons";
import { z } from "zod";

const SecretRefSchema = z.object({
	keyPath: z.string(),
	name: z.string(),
	namespace: z.string(),
});

const TlsConfigSchema = z.object({
	certificateAuthority: z.object({
		certificate: z.object({
			secretReference: SecretRefSchema,
		}),
		privateKey: z.object({
			secretReference: SecretRefSchema,
		}),
	}),
	clientCertificate: z.object({
		certificate: z.object({
			secretReference: SecretRefSchema,
		}),
		privateKey: z.object({
			secretReference: SecretRefSchema,
		}),
	}),
});

const kamajiDataStoreConfig = defineConfig({
	chartName: "KamajiDataStoreChart",
	fields: {
		name: z
			.string()
			.describe("Name of the DataStore resource")
			.default("default"),
		namespace: z
			.string()
			.describe("Kubernetes namespace where the DataStore will be deployed")
			.default("kamaji-system"),
		driver: z
			.enum(["etcd", "MySQL", "PostgreSQL"])
			.describe("Kamaji Datastore driver")
			.default("etcd"),
		version: z
			.string()
			.describe("Kamaji DataStore chart version")
			.default(KnownLatestKamajiDataStoreVersion),
		endpoints: z
			.array(z.string())
			.describe("Datastore endpoint URLs")
			.default([]),
		tlsConfig: TlsConfigSchema.optional(),
		labels: z.record(z.string(), z.string()).default({}),
	},
});

export const KamajiDataStoreConfigSchema = kamajiDataStoreConfig.schema;
export const KamajiDataStoreConfigError = kamajiDataStoreConfig.ConfigError;
export { kamajiDataStoreConfig };

export type Config = InferConfig<typeof kamajiDataStoreConfig>;
