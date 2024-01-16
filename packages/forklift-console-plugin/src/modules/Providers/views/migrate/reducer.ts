import { Draft } from 'immer';
import { isProviderLocalTarget } from 'src/utils/resources';
import { v4 as randomId } from 'uuid';

import { V1beta1Plan, V1beta1Provider } from '@kubev2v/types';

import { validateK8sName, Validation } from '../../utils';
import { planTemplate } from '../create/templates';
import { toId, VmData } from '../details';

import {
  CreateVmMigration,
  PageAction,
  PlanAvailableProviders,
  PlanDescription,
  PlanName,
  PlanTargetNamespace,
  PlanTargetProvider,
  SET_AVAILABLE_PROVIDERS,
  SET_DESCRIPTION,
  SET_NAME,
  SET_TARGET_NAMESPACE,
  SET_TARGET_PROVIDER,
} from './actions';

export interface CreateVmMigrationPageState {
  newPlan: V1beta1Plan;
  validationError: Error | null;
  apiError: Error | null;
  validation: {
    name: Validation;
    targetNamespace: Validation;
  };
  availableProviders: V1beta1Provider[];
  selectedVms: VmData[];
}

const validateUniqueName = (name: string, existingPlanNames: string[]) =>
  existingPlanNames.every((existingName) => existingName !== name);

const actions: {
  [name: string]: (
    draft: Draft<CreateVmMigrationPageState>,
    action: PageAction<CreateVmMigration, unknown>,
  ) => CreateVmMigrationPageState;
} = {
  [SET_NAME](
    draft,
    { payload: { name, existingPlanNames } }: PageAction<CreateVmMigration, PlanName>,
  ) {
    draft.newPlan.metadata.name = name;
    draft.validation.name =
      validateK8sName(name) && validateUniqueName(name, existingPlanNames) ? 'success' : 'error';
    return draft;
  },
  [SET_DESCRIPTION](
    draft,
    { payload: { description } }: PageAction<CreateVmMigration, PlanDescription>,
  ) {
    draft.newPlan.spec.description = description;
    return draft;
  },
  [SET_TARGET_NAMESPACE](
    draft,
    { payload: { targetNamespace } }: PageAction<CreateVmMigration, PlanTargetNamespace>,
  ) {
    draft.newPlan.spec.targetNamespace = targetNamespace;
    draft.validation.targetNamespace = validateK8sName(targetNamespace) ? 'success' : 'error';
    return draft;
  },
  [SET_TARGET_PROVIDER](
    draft,
    { payload: { targetProvider } }: PageAction<CreateVmMigration, PlanTargetProvider>,
  ) {
    draft.newPlan.spec.provider.destination = getObjectRef(targetProvider);
    draft.newPlan.spec.targetNamespace = undefined;
    draft.validation.targetNamespace = 'default';
    return draft;
  },
  [SET_AVAILABLE_PROVIDERS](
    draft,
    { payload: { availableProviders } }: PageAction<CreateVmMigration, PlanAvailableProviders>,
  ) {
    const targetProvider = draft.newPlan.spec.provider.destination;
    if (
      !targetProvider ||
      !availableProviders.find((p) => p?.metadata?.name === targetProvider.name)
    ) {
      // set the default provider if none is set
      // reset the provider if provider was removed
      const firstHostProvider = availableProviders.find((p) => isProviderLocalTarget(p));
      draft.newPlan.spec.provider.destination =
        firstHostProvider && getObjectRef(firstHostProvider);
      draft.newPlan.spec.targetNamespace = undefined;
      draft.validation.targetNamespace = 'default';
    }
    draft.availableProviders = availableProviders;
    return draft;
  },
};

export const reducer = (
  draft: Draft<CreateVmMigrationPageState>,
  action: PageAction<CreateVmMigration, unknown>,
) => {
  return actions?.[action?.type]?.(draft, action) ?? draft;
};

// based on the method used in legacy/src/common/helpers
// and mocks/src/definitions/utils
export const getObjectRef = (
  { apiVersion, kind, metadata: { name, namespace, uid } = {} }: V1beta1Provider = {
    apiVersion: undefined,
    kind: undefined,
  },
) => ({
  apiVersion,
  kind,
  name,
  namespace,
  uid,
});

export const createInitialState = ({
  namespace,
  sourceProvider,
  selectedVms,
}: {
  namespace: string;
  sourceProvider: V1beta1Provider;
  selectedVms: VmData[];
}): CreateVmMigrationPageState => ({
  newPlan: {
    ...planTemplate,
    metadata: {
      ...planTemplate?.metadata,
      name: sourceProvider?.metadata?.name
        ? `${sourceProvider?.metadata?.name}-${randomId().substring(0, 8)}`
        : undefined,
      namespace: namespace || process?.env?.DEFAULT_NAMESPACE || 'default',
    },
    spec: {
      ...planTemplate?.spec,
      provider: {
        source: getObjectRef(sourceProvider),
        destination: undefined,
      },
      targetNamespace: namespace,
      vms: selectedVms.map((data) => ({ name: data.name, id: toId(data) })),
    },
  },
  validationError: null,
  apiError: null,
  availableProviders: [],
  selectedVms,
  validation: {
    name: 'default',
    targetNamespace: 'default',
  },
});
