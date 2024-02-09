import { FC } from 'react';
import { Draft } from 'immer';
import { v4 as randomId } from 'uuid';

import { DefaultRow, ResourceFieldFactory, RowProps, withTr } from '@kubev2v/common';
import {
  IoK8sApimachineryPkgApisMetaV1ObjectMeta,
  OpenShiftNamespace,
  ProviderType,
  V1beta1Plan,
  V1beta1Provider,
} from '@kubev2v/types';

import { getIsTarget, validateK8sName } from '../../../utils';
import { VmData } from '../../details';
import { openShiftVmFieldsMetadataFactory } from '../../details/tabs/VirtualMachines/OpenShiftVirtualMachinesList';
import { OpenShiftVirtualMachinesCells } from '../../details/tabs/VirtualMachines/OpenShiftVirtualMachinesRow';
import { openStackVmFieldsMetadataFactory } from '../../details/tabs/VirtualMachines/OpenStackVirtualMachinesList';
import { OpenStackVirtualMachinesCells } from '../../details/tabs/VirtualMachines/OpenStackVirtualMachinesRow';
import { ovaVmFieldsMetadataFactory } from '../../details/tabs/VirtualMachines/OvaVirtualMachinesList';
import { OvaVirtualMachinesCells } from '../../details/tabs/VirtualMachines/OvaVirtualMachinesRow';
import { oVirtVmFieldsMetadataFactory } from '../../details/tabs/VirtualMachines/OVirtVirtualMachinesList';
import { OVirtVirtualMachinesCells } from '../../details/tabs/VirtualMachines/OVirtVirtualMachinesRow';
import { vSphereVmFieldsMetadataFactory } from '../../details/tabs/VirtualMachines/VSphereVirtualMachinesList';
import { VSphereVirtualMachinesCells } from '../../details/tabs/VirtualMachines/VSphereVirtualMachinesRow';
import {
  CreateVmMigrationPageState,
  Mapping,
  NETWORK_MAPPING_REGENERATED,
  NetworkAlerts,
  STORAGE_MAPPING_REGENERATED,
  StorageAlerts,
} from '../types';

import { calculateNetworks, calculateStorages } from './calculateMappings';

export const validateUniqueName = (name: string, existingNames: string[]) =>
  existingNames.every((existingName) => existingName !== name);

export const validatePlanName = (name: string, existingPlans: V1beta1Plan[]) =>
  validateK8sName(name) &&
  validateUniqueName(
    name,
    existingPlans.map((plan) => plan?.metadata?.name ?? ''),
  )
    ? 'success'
    : 'error';

export const validateTargetNamespace = (
  namespace: string,
  availableNamespaces: OpenShiftNamespace[],
  alreadyInUseBySelectedVms: boolean,
) =>
  validateK8sName(namespace) &&
  availableNamespaces?.find((n) => n.name === namespace) &&
  !alreadyInUseBySelectedVms
    ? 'success'
    : 'error';

export const setTargetProvider = (
  draft: Draft<CreateVmMigrationPageState>,
  targetProviderName: string,
  availableProviders: V1beta1Provider[],
): V1beta1Provider => {
  const {
    existingResources,
    validation,
    underConstruction: { plan, netMap, storageMap },
    workArea,
  } = draft;

  if (plan.spec.provider.destination) {
    // case: changing already chosen provider
    // reset props that depend on the target provider
    plan.spec.targetNamespace = undefined;
    // temporarily assume no namespace is OK - the validation will continue when new namespaces are loaded
    validation.targetNamespace = 'default';
    existingResources.targetNamespaces = [];
    existingResources.targetNetworks = [];
    existingResources.targetStorages = [];
    draft.calculatedPerNamespace = initCalculatedPerNamespaceSlice();
  }

  // there might be no target provider in the namespace
  const resolvedTarget = resolveTargetProvider(targetProviderName, availableProviders);
  validation.targetProvider = resolvedTarget ? 'success' : 'error';
  plan.spec.provider.destination = resolvedTarget && getObjectRef(resolvedTarget);
  netMap.spec.provider.destination = resolvedTarget && getObjectRef(resolvedTarget);
  storageMap.spec.provider.destination = resolvedTarget && getObjectRef(resolvedTarget);
  workArea.targetProvider = resolvedTarget;
  return resolvedTarget;
};

export const setTargetNamespace = (
  draft: Draft<CreateVmMigrationPageState>,
  targetNamespace: string,
): void => {
  const {
    underConstruction: { plan },
    calculatedOnce: { namespacesUsedBySelectedVms },
    workArea: { targetProvider },
    receivedAsParams: { sourceProvider },
  } = draft;

  plan.spec.targetNamespace = targetNamespace;
  draft.validation.targetNamespace = validateTargetNamespace(
    targetNamespace,
    draft.existingResources.targetNamespaces,
    alreadyInUseBySelectedVms({
      namespace: targetNamespace,
      namespacesUsedBySelectedVms,
      targetProvider,
      sourceProvider,
    }),
  );

  recalculateNetworks(draft);
  recalculateStorages(draft);
};

export const areMappingsEqual = (a: Mapping[], b: Mapping[]) => {
  if (a?.length !== b.length) {
    return;
  }
  return a?.every(({ source, destination }) =>
    b.find((mapping) => mapping.source === source && mapping.destination === destination),
  );
};

export const recalculateStorages = (draft) => {
  const storageMappings = draft.calculatedPerNamespace.storageMappings;
  draft.calculatedPerNamespace = {
    ...draft.calculatedPerNamespace,
    ...calculateStorages(draft),
  };

  if (
    storageMappings?.length &&
    !areMappingsEqual(storageMappings, draft.calculatedPerNamespace.storageMappings)
  ) {
    addIfMissing<StorageAlerts>(STORAGE_MAPPING_REGENERATED, draft.alerts.storageMappings.warnings);
  }
};

export const recalculateNetworks = (draft) => {
  const networkMappings = draft.calculatedPerNamespace.networkMappings;
  draft.calculatedPerNamespace = {
    ...draft.calculatedPerNamespace,
    ...calculateNetworks(draft),
  };
  if (
    networkMappings &&
    !areMappingsEqual(networkMappings, draft.calculatedPerNamespace.networkMappings)
  ) {
    addIfMissing<NetworkAlerts>(NETWORK_MAPPING_REGENERATED, draft.alerts.networkMappings.warnings);
  }
};

export const initCalculatedPerNamespaceSlice =
  (): CreateVmMigrationPageState['calculatedPerNamespace'] => ({
    targetNetworks: [],
    targetStorages: [],
    networkMappings: undefined,
    storageMappings: undefined,
    sourceStorages: [],
    sourceNetworks: [],
  });

export const resolveTargetProvider = (name: string, availableProviders: V1beta1Provider[]) =>
  availableProviders.filter(getIsTarget).find((p) => p?.metadata?.name === name);

// based on the method used in legacy/src/common/helpers
// and mocks/src/definitions/utils
export const getObjectRef = (
  {
    apiVersion,
    kind,
    metadata: { name, namespace, uid } = {},
  }: {
    apiVersion: string;
    kind: string;
    metadata?: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
  } = {
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

export const generateName = (base: string) => `${base}-${randomId().substring(0, 8)}`;

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

export const addIfMissing = <T>(key: T, keys: T[]) => {
  console.warn('addIfMissing', key, keys);
  if (keys.includes(key)) {
    return;
  }
  keys.push(key);
};

export const alreadyInUseBySelectedVms = ({
  namespace,
  sourceProvider,
  targetProvider,
  namespacesUsedBySelectedVms,
}: {
  namespace: string;
  sourceProvider: V1beta1Provider;
  targetProvider: V1beta1Provider;
  namespacesUsedBySelectedVms: string[];
}) =>
  sourceProvider.spec?.url === targetProvider?.spec?.url &&
  sourceProvider.spec?.type === 'openshift' &&
  namespacesUsedBySelectedVms.some((name) => name === namespace);
