import { V1beta1NetworkMap, V1beta1StorageMap } from '@kubev2v/types';

export interface TargetProject {
  name: string;
  isPreexisting: boolean;
}

export interface NetworkMap extends Partial<V1beta1NetworkMap> {
  isPreExisting: boolean;
}

export interface StorageMap extends Partial<V1beta1StorageMap> {
  isPreExisting: boolean;
}

export enum PlanCreationFields {
  planName = 'planName',
  planProject = 'planProject',
  sourceProvider = 'sourceProvider',
  targetProvider = 'targetProvider',
  targetProject = 'targetProject',
  networkMap = 'networkMap',
  storageMap = 'storageMap',
}

export interface PlanTestData {
  [PlanCreationFields.planName]: string;
  [PlanCreationFields.planProject]: string;
  [PlanCreationFields.sourceProvider]: string;
  [PlanCreationFields.targetProvider]: string;
  [PlanCreationFields.targetProject]: TargetProject;
  [PlanCreationFields.networkMap]: NetworkMap;
  [PlanCreationFields.storageMap]: StorageMap;
}

/**
 * Helper to create plan test data with proper typing
 */
export const createPlanTestData = (data: PlanTestData): PlanTestData => ({ ...data });

/**
 * Represents the structure of the .providers.json file.
 * This is for deserializing the provider credentials and configuration.
 */
export interface ProviderConfig {
  type: 'vsphere' | 'ovirt' | 'ova' | 'openstack';
  api_url: string;
  endpoint_type?: 'vcenter' | 'esxi';
  username: string;
  password: string;
  vddk_init_image?: string;
}

/**
 * Represents the data needed to fill the Create Provider UI form.
 * This is a flat structure that matches the UI components.
 */
export interface ProviderData {
  name: string;
  type: 'vsphere' | 'ovirt' | 'ova' | 'openstack';
  endpointType?: 'vcenter' | 'esxi';
  hostname: string;
  username: string;
  password?: string;
  vddkInitImage?: string;
}
