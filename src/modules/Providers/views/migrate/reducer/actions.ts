import { getDefaultNamespace } from 'src/utils/namespaces';

import type {
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

import type { InventoryNetwork } from '../../../hooks/useNetworks';
import type { InventoryStorage } from '../../../hooks/useStorages';
import type { VmData } from '../../details/tabs/VirtualMachines/components/VMCellProps';
import type { Mapping, NetworkAlerts, StorageAlerts } from '../types';

import type { InitialStateParameters } from './createInitialState';

export const POD_NETWORK = 'Pod Networking';
export const DEFAULT_NAMESPACE = getDefaultNamespace();

// action type names
export const SET_NAME = 'SET_NAME';
export const SET_PROJECT_NAME = 'SET_PROJECT_NAME';
export const SET_SOURCE_PROVIDER = 'SET_SOURCE_PROVIDER';
export const SET_SELECTED_VMS = 'SET_SELECTED_VMS';
type SET_DESCRIPTION = 'SET_DESCRIPTION';
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
export const START_CREATE = 'START_CREATE';
export const SET_API_ERROR = 'SET_API_ERROR';
export const REMOVE_ALERT = 'REMOVE_ALERT';
export const INIT = 'INIT';

export type CreateVmMigration =
  | typeof SET_NAME
  | typeof SET_PROJECT_NAME
  | typeof SET_SOURCE_PROVIDER
  | typeof SET_SELECTED_VMS
  | SET_DESCRIPTION
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
  | typeof START_CREATE
  | typeof SET_API_ERROR
  | typeof SET_EXISTING_STORAGE_MAPS
  | typeof SET_AVAILABLE_SOURCE_STORAGES
  | typeof SET_AVAILABLE_TARGET_STORAGES
  | typeof REMOVE_ALERT
  | typeof INIT;

export type PageAction<S, T> = {
  type: S;
  payload: T;
};

// action payload types

export type PlanName = {
  name: string;
};

export type ProjectName = {
  name: string;
};

export type SourceProvider = {
  sourceProvider: V1beta1Provider;
};

export type SelectedVms = {
  vms: VmData[];
  sourceProvider: V1beta1Provider;
};

export type PlanTargetProvider = {
  targetProviderName: string;
};

export type PlanTargetNamespace = {
  targetNamespace: string;
};

export type PlanAvailableProviders = {
  availableProviders: V1beta1Provider[];
  loading: boolean;
  error?: Error;
};

export type PlanExistingPlans = {
  existingPlans: V1beta1Plan[];
  loading: boolean;
  error?: Error;
};

export type PlanExistingNetMaps = {
  existingNetMaps: V1beta1NetworkMap[];
  loading: boolean;
  error?: Error;
};

export type PlanExistingStorageMaps = {
  existingStorageMaps: V1beta1StorageMap[];
  loading: boolean;
  error?: Error;
};

export type PlanAvailableTargetNamespaces = {
  availableTargetNamespaces: OpenShiftNamespace[];
  loading: boolean;
  error?: Error;
};

export type PlanAvailableTargetNetworks = {
  availableTargetNetworks: OpenShiftNetworkAttachmentDefinition[];
  loading: boolean;
  error?: Error;
};

export type PlanAvailableSourceNetworks = {
  availableSourceNetworks: InventoryNetwork[];
  loading: boolean;
  error?: Error;
};

export type PlanAvailableTargetStorages = {
  availableTargetStorages: OpenShiftStorageClass[];
  loading: boolean;
  error?: Error;
};

export type PlanAvailableSourceStorages = {
  availableSourceStorages: InventoryStorage[];
  loading: boolean;
  error?: Error;
};

export type PlanNicProfiles = {
  nicProfiles: OVirtNicProfile[];
  loading: boolean;
  error?: Error;
};

export type PlanDisks = {
  disks: (OVirtDisk | OpenstackVolume)[];
  loading: boolean;
  error?: Error;
};

export type PlanError = {
  error: Error;
};

export type PlanAlert = {
  alertKey: NetworkAlerts | StorageAlerts;
};

export type PlanMapping = {
  current: Mapping;
  next: Mapping;
};

// action creators

export const setPlanTargetProvider = (
  targetProviderName: string,
): PageAction<CreateVmMigration, PlanTargetProvider> => ({
  payload: { targetProviderName },
  type: 'SET_TARGET_PROVIDER',
});

export const setPlanTargetNamespace = (
  targetNamespace: string,
): PageAction<CreateVmMigration, PlanTargetNamespace> => ({
  payload: { targetNamespace },
  type: 'SET_TARGET_NAMESPACE',
});

export const setPlanName = (name: string): PageAction<CreateVmMigration, PlanName> => ({
  payload: {
    name,
  },
  type: 'SET_NAME',
});

export const setProjectName = (name: string): PageAction<CreateVmMigration, ProjectName> => ({
  payload: {
    name,
  },
  type: 'SET_PROJECT_NAME',
});

export const setSourceProvider = (
  sourceProvider: V1beta1Provider,
): PageAction<CreateVmMigration, SourceProvider> => ({
  payload: {
    sourceProvider,
  },
  type: 'SET_SOURCE_PROVIDER',
});

export const setSelectedVms = (
  vms: VmData[],
  sourceProvider: V1beta1Provider,
): PageAction<CreateVmMigration, SelectedVms> => ({
  payload: {
    sourceProvider,
    vms,
  },
  type: 'SET_SELECTED_VMS',
});

export const setAvailableProviders = (
  availableProviders: V1beta1Provider[],
  loaded?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableProviders> => ({
  payload: {
    availableProviders: Array.isArray(availableProviders) ? availableProviders : [],
    error,
    loading: !loaded,
  },
  type: 'SET_AVAILABLE_PROVIDERS',
});

export const setExistingPlans = (
  existingPlans: V1beta1Plan[],
  loaded?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanExistingPlans> => ({
  payload: {
    error,
    existingPlans: Array.isArray(existingPlans) ? existingPlans : [],
    loading: !loaded,
  },
  type: 'SET_EXISTING_PLANS',
});

export const setExistingNetMaps = (
  existingNetMaps: V1beta1NetworkMap[],
  loaded?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanExistingNetMaps> => ({
  payload: {
    error,
    existingNetMaps: Array.isArray(existingNetMaps) ? existingNetMaps : [],
    loading: !loaded,
  },
  type: 'SET_EXISTING_NET_MAPS',
});

export const setExistingStorageMaps = (
  existingStorageMaps: V1beta1StorageMap[],
  loaded?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanExistingStorageMaps> => ({
  payload: {
    error,
    existingStorageMaps: Array.isArray(existingStorageMaps) ? existingStorageMaps : [],
    loading: !loaded,
  },
  type: 'SET_EXISTING_STORAGE_MAPS',
});

export const setAvailableTargetNamespaces = (
  availableTargetNamespaces: OpenShiftNamespace[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableTargetNamespaces> => ({
  payload: { availableTargetNamespaces, error, loading },
  type: 'SET_AVAILABLE_TARGET_NAMESPACES',
});

export const replaceStorageMapping = ({
  current,
  next,
}: PlanMapping): PageAction<CreateVmMigration, PlanMapping> => ({
  payload: { current, next },
  type: 'REPLACE_STORAGE_MAPPING',
});

export const addStorageMapping = (): PageAction<CreateVmMigration, unknown> => ({
  payload: {},
  type: 'ADD_STORAGE_MAPPING',
});

export const deleteStorageMapping = ({
  destination,
  source,
}: Mapping): PageAction<CreateVmMigration, Mapping> => ({
  payload: { destination, source },
  type: 'DELETE_STORAGE_MAPPING',
});

export const addNetworkMapping = (): PageAction<CreateVmMigration, unknown> => ({
  payload: {},
  type: 'ADD_NETWORK_MAPPING',
});

export const replaceNetworkMapping = ({
  current,
  next,
}: PlanMapping): PageAction<CreateVmMigration, PlanMapping> => ({
  payload: { current, next },
  type: 'REPLACE_NETWORK_MAPPING',
});

export const deleteNetworkMapping = ({
  destination,
  source,
}: Mapping): PageAction<CreateVmMigration, Mapping> => ({
  payload: { destination, source },
  type: 'DELETE_NETWORK_MAPPING',
});

export const setAvailableTargetNetworks = (
  availableTargetNetworks: OpenShiftNetworkAttachmentDefinition[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableTargetNetworks> => ({
  payload: { availableTargetNetworks, error, loading },
  type: 'SET_AVAILABLE_TARGET_NETWORKS',
});

export const setAvailableSourceNetworks = (
  availableSourceNetworks: InventoryNetwork[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableSourceNetworks> => ({
  payload: { availableSourceNetworks, error, loading },
  type: 'SET_AVAILABLE_SOURCE_NETWORKS',
});

export const setAvailableSourceStorages = (
  availableSourceStorages: InventoryStorage[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableSourceStorages> => ({
  payload: {
    availableSourceStorages,
    error,
    loading,
  },
  type: 'SET_AVAILABLE_SOURCE_STORAGES',
});

export const setAvailableTargetStorages = (
  availableTargetStorages: OpenShiftStorageClass[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableTargetStorages> => ({
  payload: { availableTargetStorages, error, loading },
  type: 'SET_AVAILABLE_TARGET_STORAGES',
});

export const setNicProfiles = (
  nicProfiles: OVirtNicProfile[],
  nicProfilesLoading?: boolean,
  nicProfilesError?: Error,
): PageAction<CreateVmMigration, PlanNicProfiles> => ({
  payload: { error: nicProfilesError, loading: nicProfilesLoading, nicProfiles },
  type: 'SET_NICK_PROFILES',
});

export const setDisks = (
  disks: (OVirtDisk | OpenstackVolume)[],
  loading?: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanDisks> => ({
  payload: { disks, error, loading },
  type: 'SET_DISKS',
});

export const startCreate = (): PageAction<CreateVmMigration, unknown> => ({
  payload: {},
  type: 'START_CREATE',
});

export const setAPiError = (error: Error): PageAction<CreateVmMigration, PlanError> => ({
  payload: { error },
  type: 'SET_API_ERROR',
});

export const removeAlert = (
  alertKey: NetworkAlerts | StorageAlerts,
): PageAction<CreateVmMigration, PlanAlert> => ({
  payload: { alertKey },
  type: 'REMOVE_ALERT',
});

export const initState = (
  namespace: string,
  planName,
  projectName,
  sourceProvider: V1beta1Provider,
  selectedVms: VmData[],
): PageAction<CreateVmMigration, InitialStateParameters> => ({
  payload: {
    namespace,
    planName,
    projectName,
    selectedVms,
    sourceProvider,
  },
  type: 'INIT',
});
