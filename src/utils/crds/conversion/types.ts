import type { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '@forklift-ui/types';

type ConversionType = 'DeepInspection' | 'Inspection' | 'InPlace' | 'Remote';

export type ConversionPhase = 'CreatingPod' | 'Failed' | 'Pending' | 'Running' | 'Succeeded';

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

type PodSettings = {
  affinity?: unknown;
  annotations?: Record<string, string>;
  generateName?: string;
  labels?: Record<string, string>;
  nodeSelector?: Record<string, string>;
  serviceAccount?: string;
  transferNetworkAnnotations?: Record<string, string>;
};

export type ConversionSpec = {
  connection: { secret: ObjectReference };
  destinationProvider?: ObjectReference;
  disks?: DiskRef[];
  image?: string;
  localMigration?: boolean;
  luks?: ObjectReference;
  podSettings?: PodSettings;
  provider: ObjectReference;
  requestKVM?: boolean;
  settings?: Record<string, string>;
  targetNamespace?: string;
  type: ConversionType;
  udn?: boolean;
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

export type ConversionStatus = {
  conditions?: ConversionCondition[];
  observedGeneration?: number;
  phase?: ConversionPhase;
  pod?: ObjectReference;
};

export type V1beta1Conversion = {
  apiVersion: 'forklift.konveyor.io/v1beta1';
  kind: 'Conversion';
  metadata: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
  spec: ConversionSpec;
  status?: ConversionStatus;
};
