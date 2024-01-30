import {
  OpenShiftNamespace,
  OpenShiftNetworkAttachmentDefinition,
  OVirtNicProfile,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1Provider,
} from '@kubev2v/types';

import { InventoryNetwork } from '../../hooks/useNetworks';

import { Mapping } from './MappingList';

export const POD_NETWORK = 'Pod Networking';
export const DEFAULT_NAMESPACE = 'default';

// action type names
export const SET_NAME = 'SET_NAME';
export const SET_DESCRIPTION = 'SET_DESCRIPTION';
export const SET_TARGET_PROVIDER = 'SET_TARGET_PROVIDER';
export const SET_TARGET_NAMESPACE = 'SET_TARGET_NAMESPACE';
export const SET_AVAILABLE_PROVIDERS = 'SET_AVAILABLE_PROVIDERS';
export const SET_EXISTING_PLANS = 'SET_EXISTING_PLANS';
export const SET_AVAILABLE_TARGET_NAMESPACES = 'SET_AVAILABLE_TARGET_NAMESPACES';
export const REPLACE_NETWORK_MAPPING = 'REPLACE_NETWORK_MAPPING';
export const REPLACE_STORAGE_MAPPING = 'REPLACE_STORAGE_MAPPING';
export const ADD_NETWORK_MAPPING = 'ADD_NETWORK_MAPPING';
export const DELETE_NETWORK_MAPPING = 'DELETE_NETWORK_MAPPING';
export const SET_AVAILABLE_TARGET_NETWORKS = 'SET_AVAILABLE_TARGET_NETWORKS';
export const SET_AVAILABLE_SOURCE_NETWORKS = 'SET_AVAILABLE_SOURCE_NETWORKS';
export const SET_NICK_PROFILES = 'SET_NICK_PROFILES';
export const SET_EXISTING_NET_MAPS = 'SET_EXISTING_NET_MAPS';
export const START_CREATE = 'START_CREATE';
export const SET_ERROR = 'SET_ERROR';

export type CreateVmMigration =
  | typeof SET_NAME
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
  | typeof SET_AVAILABLE_TARGET_NETWORKS
  | typeof SET_AVAILABLE_SOURCE_NETWORKS
  | typeof SET_NICK_PROFILES
  | typeof SET_EXISTING_NET_MAPS
  | typeof START_CREATE
  | typeof SET_ERROR;

export interface PageAction<S, T> {
  type: S;
  payload: T;
}

// action payload types

export interface PlanName {
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

export interface PlanNickProfiles {
  nickProfiles: OVirtNicProfile[];
  loading: boolean;
  error?: Error;
}

export interface PlanError {
  error: Error;
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

export const setAvailableProviders = (
  availableProviders: V1beta1Provider[],
  loaded: boolean,
  error: Error,
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
  loaded: boolean,
  error: Error,
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
  loaded: boolean,
  error: Error,
): PageAction<CreateVmMigration, PlanExistingNetMaps> => ({
  type: 'SET_EXISTING_NET_MAPS',
  payload: {
    existingNetMaps: Array.isArray(existingNetMaps) ? existingNetMaps : [],
    loading: !loaded,
    error,
  },
});

export const setAvailableTargetNamespaces = (
  availableTargetNamespaces: OpenShiftNamespace[],
  loading: boolean,
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
  loading: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableTargetNetworks> => ({
  type: 'SET_AVAILABLE_TARGET_NETWORKS',
  payload: { availableTargetNetworks, loading, error },
});

export const setAvailableSourceNetworks = (
  availableSourceNetworks: InventoryNetwork[],
  loading: boolean,
  error?: Error,
): PageAction<CreateVmMigration, PlanAvailableSourceNetworks> => ({
  type: 'SET_AVAILABLE_SOURCE_NETWORKS',
  payload: { availableSourceNetworks, loading, error },
});

export const setNicProfiles = (
  nickProfiles: OVirtNicProfile[],
  nicProfilesLoading: boolean,
  nicProfilesError: Error,
): PageAction<CreateVmMigration, PlanNickProfiles> => ({
  type: 'SET_NICK_PROFILES',
  payload: { nickProfiles, loading: nicProfilesLoading, error: nicProfilesError },
});

export const startCreate = (): PageAction<CreateVmMigration, unknown> => ({
  type: 'START_CREATE',
  payload: {},
});

export const setError = (error: Error): PageAction<CreateVmMigration, PlanError> => ({
  type: 'SET_ERROR',
  payload: { error },
});
