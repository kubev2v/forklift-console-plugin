import type { FieldValues } from 'react-hook-form';
import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import type { TargetPowerState, TargetPowerStateValue } from 'src/plans/constants';
import type { StorageMapping } from 'src/storageMaps/constants';
import type { TargetStorage } from 'src/storageMaps/types';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OpenshiftVM,
  OpenstackNetwork,
  OpenstackVM,
  OvaNetwork,
  OvaVM,
  OVirtNetwork,
  OVirtNicProfile,
  OVirtVM,
  V1beta1Hook,
  V1beta1NetworkMap,
  V1beta1PlanSpecTransferNetwork,
  V1beta1PlanSpecVmsLuks,
  V1beta1Provider,
  V1beta1StorageMap,
  V1NetworkAttachmentDefinition,
  VSphereNetwork,
  VSphereVM,
} from '@kubev2v/types';

import type { GeneralFormFieldId } from './steps/general-information/constants';
import type { HooksFormFieldId, MigrationHook } from './steps/migration-hooks/constants';
import type { MigrationTypeFieldId, MigrationTypeValue } from './steps/migration-type/constants';
import type { NetworkMapFieldId, NetworkMapping } from './steps/network-map/constants';
import type { DiskPassPhrase, OtherSettingsFormFieldId } from './steps/other-settings/constants';
import type { CreatePlanStorageMapFieldId } from './steps/storage-map/constants';
import type { VmFormFieldId } from './steps/virtual-machines/constants';

export type ProviderNetwork =
  | (Omit<OpenShiftNetworkAttachmentDefinition, 'object'> & {
      object: V1NetworkAttachmentDefinition | undefined;
    })
  | OpenstackNetwork
  | OVirtNetwork
  | VSphereNetwork
  | OvaNetwork;

type VsphereVirtualMachine = VSphereVM & {
  changeTrackingEnabled: boolean;
};

type OvaVirtualMachine = Omit<OvaVM, 'changeTrackingEnabled'>;

export type ProviderVirtualMachine =
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
  [GeneralFormFieldId.ShowDefaultProjects]: boolean;
  [VmFormFieldId.Vms]: Record<string, ProviderVirtualMachine>;
  [NetworkMapFieldId.ExistingNetworkMap]: V1beta1NetworkMap | undefined;
  [NetworkMapFieldId.NetworkMap]: NetworkMapping[];
  [NetworkMapFieldId.NetworkMapName]: string;
  [CreatePlanStorageMapFieldId.ExistingStorageMap]: V1beta1StorageMap | undefined;
  [CreatePlanStorageMapFieldId.StorageMap]: StorageMapping[];
  [CreatePlanStorageMapFieldId.StorageMapName]: string;
  [MigrationTypeFieldId.MigrationType]: MigrationTypeValue;
  [OtherSettingsFormFieldId.DiskDecryptionPassPhrases]: DiskPassPhrase[];
  [OtherSettingsFormFieldId.NBDEClevis]: boolean;
  [OtherSettingsFormFieldId.PreserveStaticIps]: boolean;
  [OtherSettingsFormFieldId.MigrateSharedDisks]: boolean;
  [HooksFormFieldId.PreMigration]: MigrationHook;
  [HooksFormFieldId.PostMigration]: MigrationHook;
  [OtherSettingsFormFieldId.RootDevice]: string;
  [OtherSettingsFormFieldId.TransferNetwork]: V1beta1PlanSpecTransferNetwork;
  [OtherSettingsFormFieldId.TargetPowerState]: TargetPowerState;
};

export type MappingValue = { id?: string; name: string };

export type MappingFieldIds = {
  sourceField: string;
  targetField: string;
  mapField: string;
};

export type CategorizedSourceMappings = {
  used: MappingValue[];
  other: MappingValue[];
};

export type CreatePlanParams = {
  planName: string;
  planProject: string;
  sourceProvider: V1beta1Provider | undefined;
  targetProvider: V1beta1Provider | undefined;
  targetProject: string;
  networkMap: V1beta1NetworkMap;
  storageMap: V1beta1StorageMap;
  vms: ProviderVirtualMachine[];
  migrationType: MigrationTypeValue;
  preserveStaticIps?: boolean;
  rootDevice?: string;
  transferNetwork?: V1beta1PlanSpecTransferNetwork;
  migrateSharedDisks?: boolean;
  luks?: V1beta1PlanSpecVmsLuks;
  nbdeClevis?: boolean;
  preHook?: V1beta1Hook;
  postHook?: V1beta1Hook;
  targetPowerState: TargetPowerStateValue;
};

type ResourceQueryResult<T> = [T, boolean, Error | null];

export type CreatePlanWizardContextProps = {
  network: {
    sources: ResourceQueryResult<InventoryNetwork[]>;
    targets: ResourceQueryResult<OpenShiftNetworkAttachmentDefinition[]>;
    oVirtNicProfiles: ResourceQueryResult<OVirtNicProfile[]>;
  };
  storage: {
    sources: ResourceQueryResult<InventoryStorage[]>;
    targets: ResourceQueryResult<TargetStorage[]>;
  };
  vmsWithDisks: ResourceQueryResult<ProviderVirtualMachine[]>;
};
