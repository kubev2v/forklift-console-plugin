import type { FieldValues } from 'react-hook-form';

import type {
  OpenshiftVM,
  OpenstackVM,
  OvaVM,
  OVirtVM,
  V1beta1Provider,
  VSphereVM,
} from '@kubev2v/types';

import type { GeneralFormFieldId } from './steps/general-information/constants';
import type { MigrationTypeFieldId, MigrationTypeValue } from './steps/migration-type/constants';
import type { NetworkMapFieldId, NetworkMapping } from './steps/network-map/constants';
import type { StorageMapFieldId, StorageMapping } from './steps/storage-map/constants';
import type { VmFormFieldId } from './steps/virtual-machines/constants';

export type SourceProviderMappingLabels = { used: string[]; other: string[] };

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
};
