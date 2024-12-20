import {
  OpenShiftNamespace,
  OpenShiftNetworkAttachmentDefinition,
  OpenShiftStorageClass,
  OpenstackVolume,
  OVirtDisk,
  OVirtNicProfile,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
  V1beta1StorageMap,
} from '@kubev2v/types';

import { InventoryNetwork } from '../../../hooks/useNetworks';
import { InventoryStorage } from '../../../hooks/useStorages';
import { VmData } from '../../details';
import { Mapping, NetworkAlerts, StorageAlerts } from '../types';

import { InitialStateParameters } from './createInitialState';

export const POD_NETWORK = 'Pod Networking';
export const DEFAULT_NAMESPACE = 'default';

// action type names
export const SET_NAME = 'SET_NAME';
export const SET_PROJECT_NAME = 'SET_PROJECT_NAME';
export const SET_DESCRIPTION = 'SET_DESCRIPTION';
export const SET_TARGET_PROVIDER = 'SET_TARGET_PROVIDER';
export const SET_TARGET_NAMESPACE = 'SET_TARGET_NAMESPACE';
export const SET_AVAILABLE_PROVIDERS = 'SET_AVAILABLE_PROVIDERS';
export const SET_EXISTING_PLANS = 'SET_EXISTING_PLANS';
export const SET_AVAILABLE_TARGET_NAMESPACES = 'SET_AVAILABLE_TARGET_NAMESPACES';
export const REPLACE_STORAGE_MAPPING = 'REPLACE_STORAGE_MAPPING';
export const ADD_STORAGE_MAPPING = 'ADD_STORAGE_MAPPING';
export const DELETE_STORAGE_MAPPING = 'DELETE_STORAGE_MAPPING';
export const REPLACE_NETWORK_MAPPING = 'REPLACE_NETWORK_MAPPING';
export const ADD_NETWORK_MAPPING = 'ADD_NETWORK_MAPPING';
export const DELETE_NETWORK_MAPPING = 'DELETE_NETWORK_MAPPING';
export const SET_AVAILABLE_TARGET_NETWORKS = 'SET_AVAILABLE_TARGET_NETWORKS';
export const SET_AVAILABLE_SOURCE_NETWORKS = 'SET_AVAILABLE_SOURCE_NETWORKS';
export const SET_AVAILABLE_TARGET_STORAGES = 'SET_AVAILABLE_TARGET_STORAGES';
export const SET_AVAILABLE_SOURCE_STORAGES = 'SET_AVAILABLE_SOURCE_STORAGES';
export const SET_NICK_PROFILES = 'SET_NICK_PROFILES';
export const SET_DISKS = 'SET_DISKS';
export const SET_EXISTING_NET_MAPS = 'SET_EXISTING_NET_MAPS';
export const SET_EXISTING_STORAGE_MAPS = 'SET_EXISTING_STORAGE_MAPS';
export const START_UPDATE = 'START_UPDATE';
export const START_CREATE = 'START_CREATE';
export const SET_API_ERROR = 'SET_API_ERROR';
export const REMOVE_ALERT = 'REMOVE_ALERT';
export const INIT = 'INIT';

export type CreateVmMigration =
  | typeof SET_NAME
  | typeof SET_PROJECT_NAME
  | typeof SET_DESCRIPTION
  | typeof SET_TARGET_PROVIDER
  | typeof SET_TARGET_NAMESPACE
  | typeof SET_AVAILABLE_PROVIDERS
  | typeof SET_EXISTING_PLANS
  | typeof SET_AVAILABLE_TARGET_NAMESPACES
  | typeof REPLACE_NETWORK_MAPPING
  | typeof ADD_NETWORK_MAPPING
  | typeof DELETE_NETWORK_MAPPING
  | typeof REPLACE_STORAGE_MAPPING
  | typeof ADD_STORAGE_MAPPING
  | typeof DELETE_STORAGE_MAPPING
  | typeof SET_AVAILABLE_TARGET_NETWORKS
  | typeof SET_AVAILABLE_SOURCE_NETWORKS
  | typeof SET_NICK_PROFILES
  | typeof SET_DISKS
  | typeof SET_EXISTING_NET_MAPS
  | typeof START_UPDATE
  | typeof START_CREATE
  | typeof SET_API_ERROR
  | typeof SET_EXISTING_STORAGE_MAPS
  | typeof SET_AVAILABLE_SOURCE_STORAGES
  | typeof SET_AVAILABLE_TARGET_STORAGES
  | typeof REMOVE_ALERT
  | typeof INIT;

export interface PageAction<S, T> {
  type: S;
  payload: T;
}

// action payload types

export interface PlanName {
  name: string;
}

export interface ProjectName {
  name: string;
}

export interface PlanDescription {
  description: string;
}

export interface PlanTargetProvider {
  targetProviderName: string;
}

export interface PlanTargetNamespace {
  targetNamespace: string;
}

export interface PlanAvailableProviders {
  availableProviders: V1beta1Provider[];
  loading: boolean;
  error?: Error;
}

export interface PlanExistingPlans {
  existingPlans: V1beta1Plan[];
  loading: boolean;
  error?: Error;
}

export interface PlanExistingNetMaps {
  existingNetMaps: V1beta1NetworkMap[];
  loading: boolean;
  error?: Error;
}

export interface PlanExistingStorageMaps {
  existingStorageMaps: V1beta1StorageMap[];
  loading: boolean;
  error?: Error;
}

export interface PlanAvailableTargetNamespaces {
  availableTargetNamespaces: OpenShiftNamespace[];
  loading: boolean;
  error?: Error;
}

export interface PlanAvailableTargetNetworks {
  availableTargetNetworks: OpenShiftNetworkAttachmentDefinition[];
  loading: boolean;
  error?: Error;
}

export interface PlanAvailableSourceNetworks {
  availableSourceNetworks: InventoryNetwork[];
  loading: boolean;
  error?: Error;
}

export interface PlanAvailableTargetStorages {
  availableTargetStorages: OpenShiftStorageClass[];
  loading: boolean;
  error?: Error;
}

export interface PlanAvailableSourceStorages {
  availableSourceStorages: InventoryStorage[];
  loading: boolean;
  error?: Error;
}

export interface PlanNicProfiles {
  nicProfiles: OVirtNicProfile[];
  loading: boolean;
  error?: Error;
}

export interface PlanDisks {
  disks: (OVirtDisk | OpenstackVolume)[];
  loading: boolean;
  error?: Error;
}

export interface PlanError {
  error: Error;
}

export interface PlanAlert {
  alertKey: NetworkAlerts | StorageAlerts;
}

export interface PlanMapping {
  current: Mapping;
  next: Mapping;
}

// action creators

export const setPlanTargetProvider = (
  targetProviderName: string,
): PageAction<CreateVmMigration, PlanTargetProvider> => ({
  type: 'SET_TARGET_PROVIDER',
  payload: { targetProviderName },
});

export const setPlanTargetNamespace = (
  targetNamespace: string,
): PageAction<CreateVmMigration, PlanTargetNamespace> => ({
  type: 'SET_TARGET_NAMESPACE',
  payload: { targetNamespace },
});

export const setPlanDescription = (
  description: string,
): PageAction<CreateVmMigration, PlanDescription> => ({
  type: 'SET_DESCRIPTION',
  payload: { description },
});

export const setPlanName = (name: string): PageAction<CreateVmMigration, PlanName> => ({
  type: 'SET_NAME',
  payload: {
    name,
  },
});

export const setProjectName = (name: string): PageAction<CreateVmMigration, ProjectName> => ({
  type: 'SET_PROJECT_NAME',
  payload: {
    name,
  },
});

export const setAvailableProviders = (
  availableProviders: V1beta1Provider[],
  loaded?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableProviders> => ({
  type: 'SET_AVAILABLE_PROVIDERS',
  payload: {
    availableProviders: Array.isArray(availableProviders) ? availableProviders : [],
    loading: !loaded,
    error,
  },
});

export const setExistingPlans = (
  existingPlans: V1beta1Plan[],
  loaded?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanExistingPlans> => ({
  type: 'SET_EXISTING_PLANS',
  payload: {
    existingPlans: Array.isArray(existingPlans) ? existingPlans : [],
    loading: !loaded,
    error,
  },
});

export const setExistingNetMaps = (
  existingNetMaps: V1beta1NetworkMap[],
  loaded?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanExistingNetMaps> => ({
  type: 'SET_EXISTING_NET_MAPS',
  payload: {
    existingNetMaps: Array.isArray(existingNetMaps) ? existingNetMaps : [],
    loading: !loaded,
    error,
  },
});

export const setExistingStorageMaps = (
  existingStorageMaps: V1beta1StorageMap[],
  loaded?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanExistingStorageMaps> => ({
  type: 'SET_EXISTING_STORAGE_MAPS',
  payload: {
    existingStorageMaps: Array.isArray(existingStorageMaps) ? existingStorageMaps : [],
    loading: !loaded,
    error,
  },
});

export const setAvailableTargetNamespaces = (
  availableTargetNamespaces: OpenShiftNamespace[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableTargetNamespaces> => ({
  type: 'SET_AVAILABLE_TARGET_NAMESPACES',
  payload: { availableTargetNamespaces, loading, error },
});

export const replaceStorageMapping = ({
  current,
  next,
}: PlanMapping): PageAction<CreateVmMigration, PlanMapping> => ({
  type: 'REPLACE_STORAGE_MAPPING',
  payload: { current, next },
});

export const addStorageMapping = (): PageAction<CreateVmMigration, unknown> => ({
  type: 'ADD_STORAGE_MAPPING',
  payload: {},
});

export const deleteStorageMapping = ({
  source,
  destination,
}: Mapping): PageAction<CreateVmMigration, Mapping> => ({
  type: 'DELETE_STORAGE_MAPPING',
  payload: { source, destination },
});

export const addNetworkMapping = (): PageAction<CreateVmMigration, unknown> => ({
  type: 'ADD_NETWORK_MAPPING',
  payload: {},
});

export const replaceNetworkMapping = ({
  current,
  next,
}: PlanMapping): PageAction<CreateVmMigration, PlanMapping> => ({
  type: 'REPLACE_NETWORK_MAPPING',
  payload: { current, next },
});

export const deleteNetworkMapping = ({
  source,
  destination,
}: Mapping): PageAction<CreateVmMigration, Mapping> => ({
  type: 'DELETE_NETWORK_MAPPING',
  payload: { source, destination },
});

export const setAvailableTargetNetworks = (
  availableTargetNetworks: OpenShiftNetworkAttachmentDefinition[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableTargetNetworks> => ({
  type: 'SET_AVAILABLE_TARGET_NETWORKS',
  payload: { availableTargetNetworks, loading, error },
});

export const setAvailableSourceNetworks = (
  availableSourceNetworks: InventoryNetwork[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableSourceNetworks> => ({
  type: 'SET_AVAILABLE_SOURCE_NETWORKS',
  payload: { availableSourceNetworks, loading, error },
});

export const setAvailableSourceStorages = (
  availableSourceStorages: InventoryStorage[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableSourceStorages> => ({
  type: 'SET_AVAILABLE_SOURCE_STORAGES',
  payload: {
    availableSourceStorages,
    loading,
    error,
  },
});

export const setAvailableTargetStorages = (
  availableTargetStorages: OpenShiftStorageClass[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableTargetStorages> => ({
  type: 'SET_AVAILABLE_TARGET_STORAGES',
  payload: { availableTargetStorages, loading, error },
});

export const setNicProfiles = (
  nicProfiles: OVirtNicProfile[],
  nicProfilesLoading?: boolean,
  nicProfilesError?: Error,
): PageAction<CreateVmMigration, PlanNicProfiles> => ({
  type: 'SET_NICK_PROFILES',
  payload: { nicProfiles: nicProfiles, loading: nicProfilesLoading, error: nicProfilesError },
});

export const setDisks = (
  disks: (OVirtDisk | OpenstackVolume)[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanDisks> => ({
  type: 'SET_DISKS',
  payload: { disks, loading, error },
});

export const startUpdate = (): PageAction<CreateVmMigration, unknown> => ({
  type: 'START_UPDATE',
  payload: {},
});

export const startCreate = (): PageAction<CreateVmMigration, unknown> => ({
  type: 'START_CREATE',
  payload: {},
});

export const setAPiError = (error: Error): PageAction<CreateVmMigration, PlanError> => ({
  type: 'SET_API_ERROR',
  payload: { error },
});

export const removeAlert = (
  alertKey: NetworkAlerts | StorageAlerts,
): PageAction<CreateVmMigration, PlanAlert> => ({
  type: 'REMOVE_ALERT',
  payload: { alertKey },
});

export const initState = (
  namespace: string,
  planName,
  projectName,
  sourceProvider: V1beta1Provider,
  selectedVms: VmData[],
  plan?: V1beta1Plan,
  targetProvider?: V1beta1Provider,
): PageAction<CreateVmMigration, InitialStateParameters> => ({
  type: 'INIT',
  payload: {
    namespace,
    planName,
    projectName,
    sourceProvider,
    targetProvider,
    selectedVms,
    plan,
  },
});
