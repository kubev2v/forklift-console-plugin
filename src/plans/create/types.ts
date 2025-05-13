import type { FieldValues } from 'react-hook-form';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OpenshiftVM,
  OpenstackNetwork,
  OpenstackVM,
  OvaNetwork,
  OvaVM,
  OVirtNetwork,
  OVirtVM,
  V1beta1NetworkMap,
  V1beta1Provider,
  V1beta1StorageMap,
  V1NetworkAttachmentDefinition,
  VSphereNetwork,
  VSphereVM,
} from '@kubev2v/types';

import type { GeneralFormFieldId } from './steps/general-information/constants';
import type { HooksFormFieldId, MigrationHook } from './steps/hooks/constants';
import type { MigrationTypeFieldId, MigrationTypeValue } from './steps/migration-type/constants';
import type { NetworkMapFieldId, NetworkMapping } from './steps/network-map/constants';
import type { DiskPassPhrase, OtherSettingsFormFieldId } from './steps/other-settings/constants';
import type { StorageMapFieldId, StorageMapping } from './steps/storage-map/constants';
import type { VmFormFieldId } from './steps/virtual-machines/constants';

export type ProviderNetwork =
  | (Omit<OpenShiftNetworkAttachmentDefinition, 'object'> & {
      object: V1NetworkAttachmentDefinition | undefined;
    })
  | OpenstackNetwork
  | OVirtNetwork
  | VSphereNetwork
  | OvaNetwork;

export enum ProviderType {
  Openshift = 'openshift',
  Openstack = 'openstack',
  Ova = 'ova',
  Ovirt = 'ovirt',
  Vsphere = 'vsphere',
}

type VsphereVirtualMachine = VSphereVM & {
  changeTrackingEnabled: boolean;
};

type OvaVirtualMachine = Omit<OvaVM, 'changeTrackingEnabled'>;

type ProviderVirtualMachine =
  | VsphereVirtualMachine
  | OpenshiftVM
  | OVirtVM
  | OpenstackVM
  | OvaVirtualMachine;

export type CreatePlanFormData = FieldValues & {
  [GeneralFormFieldId.PlanName]: string;
  [GeneralFormFieldId.PlanProject]: string;
  [GeneralFormFieldId.SourceProvider]: V1beta1Provider | undefined;
  [GeneralFormFieldId.TargetProvider]: V1beta1Provider | undefined;
  [GeneralFormFieldId.TargetProject]: string;
  [VmFormFieldId.Vms]: Record<string, ProviderVirtualMachine>;
  [NetworkMapFieldId.NetworkMap]: NetworkMapping[];
  [StorageMapFieldId.StorageMap]: StorageMapping[];
  [MigrationTypeFieldId.MigrationType]: MigrationTypeValue;
  [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: DiskPassPhrase[];
  [OtherSettingsFormFieldId.PreserveStaticIps]: boolean;
  [OtherSettingsFormFieldId.SharedDisks]: boolean;
  [HooksFormFieldId.PreMigration]: MigrationHook;
  [HooksFormFieldId.PostMigration]: MigrationHook;
};

export type MappingValue = { id?: string; name: string };

export type CategorizedSourceMappings = {
  used: MappingValue[];
  other: MappingValue[];
};

export type PlanSubmissionParams = {
  planName: string;
  planProject: string;
  sourceProvider: V1beta1Provider | undefined;
  targetProvider: V1beta1Provider | undefined;
  vms: ProviderVirtualMachine[];
  networkMap: NetworkMapping[];
  storageMap: StorageMapping[];
};

export type CreateNetworkMapParams = {
  networkMappings: NetworkMapping[];
  planProject: string;
  sourceProvider: V1beta1Provider | undefined;
  targetProvider: V1beta1Provider | undefined;
};

export type CreateStorageMapParams = {
  storageMappings: StorageMapping[];
  planProject: string;
  sourceProvider: V1beta1Provider | undefined;
  targetProvider: V1beta1Provider | undefined;
};

export type CreatePlanParams = {
  planName: string;
  planProject: string;
  sourceProvider: V1beta1Provider | undefined;
  targetProvider: V1beta1Provider | undefined;
  networkMap: V1beta1NetworkMap;
  storageMap: V1beta1StorageMap;
  vms: ProviderVirtualMachine[];
};
