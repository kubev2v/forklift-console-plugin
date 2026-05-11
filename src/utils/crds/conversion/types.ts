// TODO(MTV-2482): Remove this file once `@forklift-ui/types` exports
// V1beta1Conversion and related types. Tracking: kubev2v/forklift#5882.
import type { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '@forklift-ui/types';

type ConversionType = 'DeepInspection' | 'Inspection' | 'InPlace' | 'Remote';

export type ConversionPhase = 'Canceled' | 'Failed' | 'Pending' | 'Running' | 'Succeeded';

export type ConversionStage =
  | 'CreatingPod'
  | 'CreatingSnapshot'
  | 'FetchingResults'
  | 'Finished'
  | 'PodRunning'
  | 'RemovingSnapshot'
  | 'WaitingForSnapshot'
  | 'WaitingForSnapshotRemoval';

type DiskRef = {
  devicePath?: string;
  mountPath?: string;
  name: string;
  namespace?: string;
  volumeMode?: string;
};

export type ObjectReference = {
  name?: string;
  namespace?: string;
  uid?: string;
};

type DiskEncryptionType = 'Clevis' | 'LUKS';

type DiskEncryption = {
  secret?: ObjectReference;
  type: DiskEncryptionType;
};

type PodSettings = {
  affinity?: unknown;
  generateName?: string;
  nodeSelector?: Record<string, string>;
  serviceAccount?: string;
  transferNetworkAnnotations?: Record<string, string>;
};

export type ConversionSpec = {
  connection: { secret: ObjectReference };
  destination?: ObjectReference;
  diskEncryption?: DiskEncryption;
  disks?: DiskRef[];
  image?: string;
  localMigration?: boolean;
  podSettings?: PodSettings;
  settings?: Record<string, string>;
  targetNamespace?: string;
  type: ConversionType;
  vddkImage?: string;
  vm: { id: string; name?: string; type?: string };
  xfsCompatibility?: boolean;
};

export type ConversionCondition = {
  category?: string;
  durable?: boolean;
  items?: string[];
  lastTransitionTime?: string;
  message?: string;
  reason?: string;
  status?: string;
  suggestion?: string;
  type?: string;
};

export type InspectionConcern = {
  category: string;
  id: string;
  label: string;
  message: string;
};

export type OSInfo = {
  arch?: string;
  distro?: string;
  name?: string;
  version?: string;
};

export type InspectionFilesystem = {
  device: string;
  type: string;
  uuid?: string;
};

export type InspectionMountpoint = {
  device: string;
  mountPoint: string;
};

export type InspectionResult = {
  // Backend bug: may arrive as snake_case `all_checks_passed` instead of camelCase.
  // Use the `hasInspectionPassed` selector instead of reading this directly.
  all_checks_passed?: boolean;
  allChecksPassed?: boolean;
  concerns?: InspectionConcern[];
  filesystems?: InspectionFilesystem[];
  mountpoints?: InspectionMountpoint[];
  osInfo?: OSInfo;
};

type SnapshotStatus = {
  createTaskId?: string;
  moref?: string;
  owned?: boolean;
  removeTaskId?: string;
};

export type ConversionStatus = {
  completionTime?: string;
  conditions?: ConversionCondition[];
  inspectionResult?: InspectionResult;
  observedGeneration?: number;
  phase?: ConversionPhase;
  pod?: ObjectReference;
  snapshot?: SnapshotStatus;
  stage?: ConversionStage;
  startTime?: string;
};

export type V1beta1Conversion = {
  apiVersion: 'forklift.konveyor.io/v1beta1';
  kind: 'Conversion';
  metadata: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
  spec: ConversionSpec;
  status?: ConversionStatus;
};
