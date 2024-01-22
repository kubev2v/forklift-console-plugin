import { FC } from 'react';
import { Draft } from 'immer';
import { isProviderLocalOpenshift } from 'src/utils/resources';
import { v4 as randomId } from 'uuid';

import { DefaultRow, ResourceFieldFactory, RowProps, withTr } from '@kubev2v/common';
import { OpenShiftNamespace, ProviderType, V1beta1Plan, V1beta1Provider } from '@kubev2v/types';

import { getIsTarget, validateK8sName, Validation } from '../../utils';
import { planTemplate } from '../create/templates';
import { toId, VmData } from '../details';
import { openShiftVmFieldsMetadataFactory } from '../details/tabs/VirtualMachines/OpenShiftVirtualMachinesList';
import { OpenShiftVirtualMachinesCells } from '../details/tabs/VirtualMachines/OpenShiftVirtualMachinesRow';
import { openStackVmFieldsMetadataFactory } from '../details/tabs/VirtualMachines/OpenStackVirtualMachinesList';
import { OpenStackVirtualMachinesCells } from '../details/tabs/VirtualMachines/OpenStackVirtualMachinesRow';
import { ovaVmFieldsMetadataFactory } from '../details/tabs/VirtualMachines/OvaVirtualMachinesList';
import { OvaVirtualMachinesCells } from '../details/tabs/VirtualMachines/OvaVirtualMachinesRow';
import { oVirtVmFieldsMetadataFactory } from '../details/tabs/VirtualMachines/OVirtVirtualMachinesList';
import { OVirtVirtualMachinesCells } from '../details/tabs/VirtualMachines/OVirtVirtualMachinesRow';
import { vSphereVmFieldsMetadataFactory } from '../details/tabs/VirtualMachines/VSphereVirtualMachinesList';
import { VSphereVirtualMachinesCells } from '../details/tabs/VirtualMachines/VSphereVirtualMachinesRow';

import {
  CreateVmMigration,
  PageAction,
  PlanAvailableProviders,
  PlanAvailableTargetNamespaces,
  PlanDescription,
  PlanExistingPlans,
  PlanName,
  PlanTargetNamespace,
  PlanTargetProvider,
  SET_AVAILABLE_PROVIDERS,
  SET_AVAILABLE_TARGET_NAMESPACES,
  SET_DESCRIPTION,
  SET_EXISTING_PLANS,
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
    targetProvider: Validation;
  };
  availableProviders: V1beta1Provider[];
  selectedVms: VmData[];
  existingPlans: V1beta1Plan[];
  vmFieldsFactory: [ResourceFieldFactory, FC<RowProps<VmData>>];
  availableTargetNamespaces: OpenShiftNamespace[];
}

const validateUniqueName = (name: string, existingPlanNames: string[]) =>
  existingPlanNames.every((existingName) => existingName !== name);

const validatePlanName = (name: string, existingPlans: V1beta1Plan[]) =>
  validateK8sName(name) &&
  validateUniqueName(
    name,
    existingPlans.map((plan) => plan?.metadata?.name ?? ''),
  )
    ? 'success'
    : 'error';

const validateTargetNamespace = (namespace: string, availableNamespaces: OpenShiftNamespace[]) =>
  validateK8sName(namespace) && availableNamespaces?.find((n) => n.name === namespace)
    ? 'success'
    : 'error';

const actions: {
  [name: string]: (
    draft: Draft<CreateVmMigrationPageState>,
    action: PageAction<CreateVmMigration, unknown>,
  ) => CreateVmMigrationPageState;
} = {
  [SET_NAME](draft, { payload: { name } }: PageAction<CreateVmMigration, PlanName>) {
    draft.newPlan.metadata.name = name;
    draft.validation.name = validatePlanName(name, draft.existingPlans);
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
    draft.validation.targetNamespace = validateTargetNamespace(
      targetNamespace,
      draft.availableTargetNamespaces,
    );
    return draft;
  },
  [SET_TARGET_PROVIDER](
    draft,
    { payload: { targetProviderName } }: PageAction<CreateVmMigration, PlanTargetProvider>,
  ) {
    setTargetProvider(draft, targetProviderName, draft.availableProviders);
    return draft;
  },
  [SET_AVAILABLE_PROVIDERS](
    draft,
    { payload: { availableProviders } }: PageAction<CreateVmMigration, PlanAvailableProviders>,
  ) {
    draft.availableProviders = availableProviders;
    // set the default provider if none is set
    // reset the provider if provider was removed
    if (
      !availableProviders
        .filter(getIsTarget)
        .find((p) => p?.metadata?.name === draft.newPlan.spec.provider.destination?.name)
    ) {
      const firstHostProvider = availableProviders.find((p) => isProviderLocalOpenshift(p));
      setTargetProvider(draft, firstHostProvider?.metadata?.name, availableProviders);
    }
    return draft;
  },
  [SET_EXISTING_PLANS](
    draft,
    { payload: { existingPlans } }: PageAction<CreateVmMigration, PlanExistingPlans>,
  ) {
    draft.existingPlans = existingPlans;
    draft.validation.name = validatePlanName(draft.newPlan.metadata.name, existingPlans);
    return draft;
  },
  [SET_AVAILABLE_TARGET_NAMESPACES](
    draft,
    {
      payload: { availableTargetNamespaces },
    }: PageAction<CreateVmMigration, PlanAvailableTargetNamespaces>,
  ) {
    draft.availableTargetNamespaces = availableTargetNamespaces;
    draft.validation.targetNamespace = validateTargetNamespace(
      draft.newPlan.spec.targetNamespace,
      availableTargetNamespaces,
    );
    return draft;
  },
};

const setTargetProvider = (
  draft: Draft<CreateVmMigrationPageState>,
  targetProviderName: string,
  availableProviders: V1beta1Provider[],
) => {
  // there might be no target provider in the namespace
  const resolvedTarget = availableProviders
    .filter(getIsTarget)
    .find((p) => p?.metadata?.name === targetProviderName);
  draft.newPlan.spec.provider.destination = resolvedTarget && getObjectRef(resolvedTarget);
  draft.newPlan.spec.targetNamespace = isProviderLocalOpenshift(resolvedTarget)
    ? draft.newPlan.metadata.namespace
    : 'default';
  // assume the value is correct and wait until the namespaces will be loaded for further validation
  draft.validation.targetNamespace = 'default';
  draft.validation.targetProvider = resolvedTarget ? 'success' : 'error';
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
      namespace,
    },
    spec: {
      ...planTemplate?.spec,
      provider: {
        source: getObjectRef(sourceProvider),
        destination: undefined,
      },
      targetNamespace: undefined,
      vms: selectedVms.map((data) => ({ name: data.name, id: toId(data) })),
    },
  },
  validationError: null,
  apiError: null,
  availableProviders: [],
  selectedVms,
  existingPlans: [],
  validation: {
    name: 'default',
    targetNamespace: 'default',
    targetProvider: 'default',
  },
  vmFieldsFactory: resourceFieldsForType(sourceProvider?.spec?.type as ProviderType),
  availableTargetNamespaces: [],
});

export const resourceFieldsForType = (
  type: ProviderType,
): [ResourceFieldFactory, FC<RowProps<VmData>>] => {
  switch (type) {
    case 'openshift':
      return [openShiftVmFieldsMetadataFactory, withTr(OpenShiftVirtualMachinesCells)];
    case 'openstack':
      return [openStackVmFieldsMetadataFactory, withTr(OpenStackVirtualMachinesCells)];
    case 'ova':
      return [ovaVmFieldsMetadataFactory, withTr(OvaVirtualMachinesCells)];
    case 'ovirt':
      return [oVirtVmFieldsMetadataFactory, withTr(OVirtVirtualMachinesCells)];
    case 'vsphere':
      return [vSphereVmFieldsMetadataFactory, withTr(VSphereVirtualMachinesCells)];
    default:
      return [() => [], DefaultRow];
  }
};
