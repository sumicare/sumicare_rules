/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

export { Backup as VeleroBackup } from "Storage/Crds/Imports/backup-velero.io";
export { BackupRepository as VeleroBackupRepository } from "Storage/Crds/Imports/backuprepository-velero.io";
export { BackupStorageLocation as VeleroBackupStorageLocation } from "Storage/Crds/Imports/backupstoragelocation-velero.io";
export {
	Backup as CloudNativePgBackup,
	Cluster as CloudNativePgCluster,
	ClusterImageCatalog as CloudNativePgClusterImageCatalog,
	Database as CloudNativePgDatabase,
	DatabaseRole as CloudNativePgDatabaseRole,
	FailoverQuorum as CloudNativePgFailoverQuorum,
	ImageCatalog as CloudNativePgImageCatalog,
	Pooler as CloudNativePgPooler,
	Publication as CloudNativePgPublication,
	ScheduledBackup as CloudNativePgScheduledBackup,
	Subscription as CloudNativePgSubscription,
} from "Storage/Crds/Imports/cloudnativepg-postgresql.cnpg.io";
export { DataDownload as VeleroDataDownload } from "Storage/Crds/Imports/datadownload-velero.io"; // v2alpha1
export { DataUpload as VeleroDataUpload } from "Storage/Crds/Imports/dataupload-velero.io"; // v2alpha1
export { DeleteBackupRequest as VeleroDeleteBackupRequest } from "Storage/Crds/Imports/deletebackuprequest-velero.io";
export { DownloadRequest as VeleroDownloadRequest } from "Storage/Crds/Imports/downloadrequest-velero.io";
export { GarageNode } from "Storage/Crds/Imports/garagenode-deuxfleurs.fr";
export { PodVolumeBackup as VeleroPodVolumeBackup } from "Storage/Crds/Imports/podvolumebackup-velero.io";
export { PodVolumeRestore as VeleroPodVolumeRestore } from "Storage/Crds/Imports/podvolumerestore-velero.io";
export { Restore as VeleroRestore } from "Storage/Crds/Imports/restore-velero.io";
export {
	CephBlockPool as RookCephBlockPool,
	CephBlockPoolRadosNamespace as RookCephBlockPoolRadosNamespace,
	CephBucketNotification as RookCephBucketNotification,
	CephBucketTopic as RookCephBucketTopic,
	CephClient as RookCephClient,
	CephCluster as RookCephCluster,
	CephCosiDriver as RookCephCosiDriver,
	CephFilesystem as RookCephFilesystem,
	CephFilesystemMirror as RookCephFilesystemMirror,
	CephFilesystemSubVolumeGroup as RookCephFilesystemSubVolumeGroup,
	CephNfs as RookCephNfs,
	CephNvMeOfGateway as RookCephNvMeOfGateway,
	CephObjectRealm as RookCephObjectRealm,
	CephObjectStore as RookCephObjectStore,
	CephObjectStoreAccount as RookCephObjectStoreAccount,
	CephObjectStoreUser as RookCephObjectStoreUser,
	CephObjectZone as RookCephObjectZone,
	CephObjectZoneGroup as RookCephObjectZoneGroup,
	CephRbdMirror as RookCephRbdMirror,
} from "Storage/Crds/Imports/rook-ceph.rook.io";
export {
	ObjectBucket as RookObjectBucket, // v1alpha1
	ObjectBucketClaim as RookObjectBucketClaim, // v1alpha1
} from "Storage/Crds/Imports/rook-objectbucket.io";
export { Schedule as VeleroSchedule } from "Storage/Crds/Imports/schedule-velero.io";
export { SecretProviderClass } from "Storage/Crds/Imports/secretproviderclass-secrets-store.csi.x-k8s.io";
export { ServerStatusRequest as VeleroServerStatusRequest } from "Storage/Crds/Imports/serverstatusrequest-velero.io";
export { LogicalVolume as TopolvmLogicalVolume } from "Storage/Crds/Imports/topolvm-topolvm.io";
export { LogicalVolume as TopolvmLegacyLogicalVolume } from "Storage/Crds/Imports/topolvmlegacy-topolvm.cybozu.com";
export { ValkeyCluster } from "Storage/Crds/Imports/valkeycluster-valkey.io"; // v1alpha1
export { ValkeyNode } from "Storage/Crds/Imports/valkeynode-valkey.io"; // v1alpha1
export { VolumeSnapshotLocation as VeleroVolumeSnapshotLocation } from "Storage/Crds/Imports/volumesnapshotlocation-velero.io";
