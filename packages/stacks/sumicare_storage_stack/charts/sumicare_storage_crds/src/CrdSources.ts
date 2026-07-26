/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { GithubUpstreamSource } from "@sumicare/chart-commons";
import { defineCrdSources } from "@sumicare/chart-commons";

const rook = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "rook", repo: "rook" },
	path: "deploy/examples",
	branch: "master",
	upstreamFile,
});

const cloudnativepg = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "cloudnative-pg", repo: "charts" },
	path: "charts/cloudnative-pg/templates/crds",
	upstreamFile,
});

const topolvm = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "topolvm", repo: "topolvm" },
	path: "charts/topolvm/templates/crds",
	upstreamFile,
});

const valkey = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "valkey-io", repo: "valkey-operator" },
	path: "config/crd/bases",
	upstreamFile,
});

const velero = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "vmware-tanzu", repo: "helm-charts" },
	path: "charts/velero/crds",
	upstreamFile,
});

const secretsStoreCsi = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kubernetes-sigs", repo: "secrets-store-csi-driver" },
	path: "config/crd/bases",
	upstreamFile,
});

/** Single source of truth for all Storage CRD kinds, groups, and upstream sources. */
export const CRD_SOURCES = defineCrdSources({
	kinds: {
		rook: {
			file: "crd-rook-all.yaml",
			disableKey: "disableRook",
			description: "Disable Rook (Ceph) CRDs",
			upstream: rook("crds.yaml"),
		},
		cloudnativepg: {
			file: "crd-cloudnativepg-all.yaml",
			disableKey: "disableCloudNativePg",
			description: "Disable CloudNative-PG CRDs",
			upstream: cloudnativepg("crds.yaml"),
		},
		garagenodes: {
			file: "crd-garage-garagenodes.yaml",
			disableKey: "disableGarageNodes",
			description: "Disable GarageNode CRD",
			upstream: {
				gitea: {
					owner: "Deuxfleurs",
					repo: "garage",
					baseUrl: "https://git.deuxfleurs.fr",
					branch: "main-v2",
				},
				path: "script/k8s/crd",
				upstreamFile: "garagenodes.deuxfleurs.fr.yaml",
			},
		},
		topolvmlegacy: {
			file: "crd-topolvm-cybozu-logicalvolumes.yaml",
			disableKey: "disableTopolvmLegacy",
			description: "Disable TopoLVM legacy LogicalVolume CRD",
			upstream: topolvm("topolvm.cybozu.com_logicalvolumes.yaml"),
		},
		topolvm: {
			file: "crd-topolvm-io-logicalvolumes.yaml",
			disableKey: "disableTopolvm",
			description: "Disable TopoLVM LogicalVolume CRD",
			upstream: topolvm("topolvm.io_logicalvolumes.yaml"),
		},
		valkeyclusters: {
			file: "crd-valkey-clusters.yaml",
			disableKey: "disableValkeyClusters",
			description: "Disable ValkeyCluster CRD",
			upstream: valkey("valkey.io_valkeyclusters.yaml"),
		},
		valkeynodes: {
			file: "crd-valkey-nodes.yaml",
			disableKey: "disableValkeyNodes",
			description: "Disable ValkeyNode CRD",
			upstream: valkey("valkey.io_valkeynodes.yaml"),
		},
		backuprepositories: {
			file: "crd-velero-backuprepositories.yaml",
			disableKey: "disableBackupRepositories",
			description: "Disable BackupRepository CRD",
			upstream: velero("backuprepositories.yaml"),
		},
		backups: {
			file: "crd-velero-backups.yaml",
			disableKey: "disableBackups",
			description: "Disable Backup CRD",
			upstream: velero("backups.yaml"),
		},
		backupstoragelocations: {
			file: "crd-velero-backupstoragelocations.yaml",
			disableKey: "disableBackupStorageLocations",
			description: "Disable BackupStorageLocation CRD",
			upstream: velero("backupstoragelocations.yaml"),
		},
		datadownloads: {
			file: "crd-velero-datadownloads.yaml",
			disableKey: "disableDataDownloads",
			description: "Disable DataDownload CRD",
			upstream: velero("datadownloads.yaml"),
		},
		datauploads: {
			file: "crd-velero-datauploads.yaml",
			disableKey: "disableDataUploads",
			description: "Disable DataUpload CRD",
			upstream: velero("datauploads.yaml"),
		},
		deletebackuprequests: {
			file: "crd-velero-deletebackuprequests.yaml",
			disableKey: "disableDeleteBackupRequests",
			description: "Disable DeleteBackupRequest CRD",
			upstream: velero("deletebackuprequests.yaml"),
		},
		downloadrequests: {
			file: "crd-velero-downloadrequests.yaml",
			disableKey: "disableDownloadRequests",
			description: "Disable DownloadRequest CRD",
			upstream: velero("downloadrequests.yaml"),
		},
		podvolumebackups: {
			file: "crd-velero-podvolumebackups.yaml",
			disableKey: "disablePodVolumeBackups",
			description: "Disable PodVolumeBackup CRD",
			upstream: velero("podvolumebackups.yaml"),
		},
		podvolumerestores: {
			file: "crd-velero-podvolumerestores.yaml",
			disableKey: "disablePodVolumeRestores",
			description: "Disable PodVolumeRestore CRD",
			upstream: velero("podvolumerestores.yaml"),
		},
		restores: {
			file: "crd-velero-restores.yaml",
			disableKey: "disableRestores",
			description: "Disable Restore CRD",
			upstream: velero("restores.yaml"),
		},
		schedules: {
			file: "crd-velero-schedules.yaml",
			disableKey: "disableSchedules",
			description: "Disable Schedule CRD",
			upstream: velero("schedules.yaml"),
		},
		serverstatusrequests: {
			file: "crd-velero-serverstatusrequests.yaml",
			disableKey: "disableServerStatusRequests",
			description: "Disable ServerStatusRequest CRD",
			upstream: velero("serverstatusrequests.yaml"),
		},
		volumesnapshotlocations: {
			file: "crd-velero-volumesnapshotlocations.yaml",
			disableKey: "disableVolumeSnapshotLocations",
			description: "Disable VolumeSnapshotLocation CRD",
			upstream: velero("volumesnapshotlocations.yaml"),
		},
		secretproviderclass: {
			file: "crd-secrets-store-csi-secretproviderclasses.yaml",
			disableKey: "disableSecretProviderClass",
			description: "Disable SecretProviderClass CRD",
			upstream: secretsStoreCsi(
				"secrets-store.csi.x-k8s.io_secretproviderclasses.yaml",
			),
		},
	},
	groups: {
		rook: {
			kinds: ["rook"],
			disableKey: "disableRookGroup",
			description: "Disable all Rook CRDs",
		},
		cloudnativepg: {
			kinds: ["cloudnativepg"],
			disableKey: "disableCloudNativePgGroup",
			description: "Disable all CloudNative-PG CRDs",
		},
		garage: {
			kinds: ["garagenodes"],
			disableKey: "disableGarage",
			description: "Disable all Garage CRDs",
		},
		topolvm: {
			kinds: ["topolvmlegacy", "topolvm"],
			disableKey: "disableTopolvmGroup",
			description: "Disable all TopoLVM CRDs",
		},
		valkey: {
			kinds: ["valkeyclusters", "valkeynodes"],
			disableKey: "disableValkey",
			description: "Disable all Valkey Operator CRDs",
		},
		velero: {
			kinds: [
				"backuprepositories",
				"backups",
				"backupstoragelocations",
				"datadownloads",
				"datauploads",
				"deletebackuprequests",
				"downloadrequests",
				"podvolumebackups",
				"podvolumerestores",
				"restores",
				"schedules",
				"serverstatusrequests",
				"volumesnapshotlocations",
			],
			disableKey: "disableVelero",
			description: "Disable all Velero CRDs",
		},
		secretsStoreCsi: {
			kinds: ["secretproviderclass"],
			disableKey: "disableSecretsStoreCsi",
			description: "Disable all Secrets Store CSI CRDs",
		},
	},
});
