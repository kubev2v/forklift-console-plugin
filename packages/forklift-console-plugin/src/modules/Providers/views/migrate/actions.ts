import { V1beta1Provider } from '@kubev2v/types';

// action type names
export const SET_NAME = 'SET_NAME';
export const SET_DESCRIPTION = 'SET_DESCRIPTION';
export const SET_TARGET_PROVIDER = 'SET_TARGET_PROVIDER';
export const SET_TARGET_NAMESPACE = 'SET_TARGET_NAMESPACE';
export const SET_AVAILABLE_PROVIDERS = 'SET_AVAILABLE_PROVIDERS';

export type CreateVmMigration =
  | typeof SET_NAME
  | typeof SET_DESCRIPTION
  | typeof SET_TARGET_PROVIDER
  | typeof SET_TARGET_NAMESPACE
  | typeof SET_AVAILABLE_PROVIDERS;

export interface PageAction<S, T> {
  type: S;
  payload: T;
}

// action payload types

export interface PlanName {
  name: string;
  existingPlanNames: string[];
}

export interface PlanDescription {
  description: string;
}

export interface PlanTargetProvider {
  targetProvider: V1beta1Provider;
}

export interface PlanTargetNamespace {
  targetNamespace: string;
}

export interface PlanAvailableProviders {
  availableProviders: V1beta1Provider[];
}

// action creators

export const setPlanTargetProvider = (
  targetProvider: V1beta1Provider,
): PageAction<CreateVmMigration, PlanTargetProvider> => ({
  type: 'SET_TARGET_PROVIDER',
  payload: { targetProvider },
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

export const setPlanName = (
  name: string,
  existingPlanNames: string[],
): PageAction<CreateVmMigration, PlanName> => ({
  type: 'SET_NAME',
  payload: {
    name,
    existingPlanNames,
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
