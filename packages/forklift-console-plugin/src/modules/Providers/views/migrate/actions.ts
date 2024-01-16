import { OpenShiftNamespace, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';

// action type names
export const SET_NAME = 'SET_NAME';
export const SET_DESCRIPTION = 'SET_DESCRIPTION';
export const SET_TARGET_PROVIDER = 'SET_TARGET_PROVIDER';
export const SET_TARGET_NAMESPACE = 'SET_TARGET_NAMESPACE';
export const SET_AVAILABLE_PROVIDERS = 'SET_AVAILABLE_PROVIDERS';
export const SET_EXISTING_PLANS = 'SET_EXISTING_PLANS';
export const SET_AVAILABLE_TARGET_NAMESPACES = 'SET_AVAILABLE_TARGET_NAMESPACES';

export type CreateVmMigration =
  | typeof SET_NAME
  | typeof SET_DESCRIPTION
  | typeof SET_TARGET_PROVIDER
  | typeof SET_TARGET_NAMESPACE
  | typeof SET_AVAILABLE_PROVIDERS
  | typeof SET_EXISTING_PLANS
  | typeof SET_AVAILABLE_TARGET_NAMESPACES;

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
}

export interface PlanExistingPlans {
  existingPlans: V1beta1Plan[];
}

export interface PlanAvailableTargetNamespaces {
  availableTargetNamespaces: OpenShiftNamespace[];
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
): PageAction<CreateVmMigration, PlanAvailableProviders> => ({
  type: 'SET_AVAILABLE_PROVIDERS',
  payload: {
    availableProviders,
  },
});

export const setExistingPlans = (
  existingPlans: V1beta1Plan[],
): PageAction<CreateVmMigration, PlanExistingPlans> => ({
  type: 'SET_EXISTING_PLANS',
  payload: {
    existingPlans,
  },
});

export const setAvailableTargetNamespaces = (
  availableTargetNamespaces: OpenShiftNamespace[],
): PageAction<CreateVmMigration, PlanAvailableTargetNamespaces> => ({
  type: 'SET_AVAILABLE_TARGET_NAMESPACES',
  payload: { availableTargetNamespaces },
});
