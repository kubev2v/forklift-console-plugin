import type { FC } from 'react';
import type { Draft } from 'immer';
import { DefaultRow } from 'src/components/common/TableView/DefaultRow';
import type { RowProps } from 'src/components/common/TableView/types';
import { withTr } from 'src/components/common/TableView/withTr';
import { getIsTarget } from 'src/modules/Providers/utils/helpers/getIsTarget';
import { validateK8sName } from 'src/modules/Providers/utils/validators/common';

import type { ResourceField } from '@components/common/utils/types';
import type {
  IoK8sApimachineryPkgApisMetaV1ObjectMeta,
  OVirtNicProfile,
  ProviderType,
  V1beta1Plan,
  V1beta1Provider,
} from '@kubev2v/types';

import type { VmData } from '../../details/tabs/VirtualMachines/components/VMCellProps';
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
  type CreateVmMigrationPageState,
  type Mapping,
  type MappingSource,
  MULTIPLE_NICS_MAPPED_TO_POD_NETWORKING,
  NETWORK_MAPPING_EMPTY,
  NETWORK_MAPPING_REGENERATED,
  type NetworkAlerts,
  OVIRT_NICS_WITH_EMPTY_PROFILE,
  STORAGE_MAPPING_EMPTY,
  STORAGE_MAPPING_REGENERATED,
  type StorageAlerts,
  UNMAPPED_NETWORKS,
  UNMAPPED_STORAGES,
} from '../types';

import type { CreateVmMigration } from './actions';
import { calculateNetworks, calculateStorages } from './calculateMappings';
import { hasMultiplePodNetworkMappings } from './hasMultiplePodNetworkMappings';

const validateUniqueName = (name: string, existingNames: string[]) =>
  existingNames.every((existingName) => existingName !== name);

export const validatePlanName = (name: string, existingPlans: V1beta1Plan[]) =>
  validateK8sName(name) &&
  validateUniqueName(
    name,
    existingPlans.map((plan) => plan?.metadata?.name ?? ''),
  )
    ? 'success'
    : 'error';

export const validateTargetNamespace = (namespace: string, alreadyInUseBySelectedVms: boolean) =>
  Boolean(namespace) && validateK8sName(namespace) && !alreadyInUseBySelectedVms
    ? 'success'
    : 'error';

export const setTargetProvider = (
  draft: Draft<CreateVmMigrationPageState>,
  targetProviderName: string,
  availableProviders: V1beta1Provider[],
): V1beta1Provider => {
  const {
    existingResources,
    underConstruction: { netMap, plan, storageMap },
    validation,
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
    calculatedOnce: { namespacesUsedBySelectedVms },
    receivedAsParams: { sourceProvider },
    underConstruction: { plan },
    workArea: { targetProvider },
  } = draft;

  plan.spec.targetNamespace = targetNamespace;
  draft.validation.targetNamespace = validateTargetNamespace(
    targetNamespace,
    alreadyInUseBySelectedVms({
      namespace: targetNamespace,
      namespacesUsedBySelectedVms,
      sourceProvider,
      targetProvider,
    }),
  );

  recalculateNetworks(draft);
  recalculateStorages(draft);
};

const areMappingsEqual = (a: Mapping[], b: Mapping[]) => {
  if (a?.length !== b.length) {
    return;
  }
  return a?.every(({ destination, source }) =>
    b.find((mapping) => mapping.source === source && mapping.destination === destination),
  );
};

export const recalculateStorages = (draft) => {
  draft.calculatedPerNamespace = {
    ...draft.calculatedPerNamespace,
    ...calculateStorages(draft),
  };
  executeStorageMappingValidation(draft);
  reTestStorages(draft);
};

export const reTestStorages = (draft) => {
  draft.alerts.storageMappings.warnings = [];

  const { storageMappings } = draft.calculatedPerNamespace;
  if (
    storageMappings &&
    storageMappings.length > 1 &&
    !areMappingsEqual(storageMappings, draft.calculatedPerNamespace.storageMappings)
  ) {
    addIfMissing<StorageAlerts>(STORAGE_MAPPING_REGENERATED, draft.alerts.storageMappings.warnings);
  }
  if (storageMappings?.length === 0) {
    addIfMissing<StorageAlerts>(STORAGE_MAPPING_EMPTY, draft.alerts.storageMappings.warnings);
  }
};

export const recalculateNetworks = (draft) => {
  draft.calculatedPerNamespace = {
    ...draft.calculatedPerNamespace,
    ...calculateNetworks(draft),
  };
  executeNetworkMappingValidation(draft);
  reTestNetworks(draft);
};

export const reTestNetworks = (draft) => {
  draft.alerts.networkMappings.warnings = [];

  const { networkMappings } = draft.calculatedPerNamespace;
  if (
    networkMappings &&
    networkMappings.length !== 0 &&
    !areMappingsEqual(networkMappings, draft.calculatedPerNamespace.networkMappings)
  ) {
    addIfMissing<NetworkAlerts>(NETWORK_MAPPING_REGENERATED, draft.alerts.networkMappings.warnings);
  }
  if (networkMappings?.length === 0) {
    addIfMissing<NetworkAlerts>(NETWORK_MAPPING_EMPTY, draft.alerts.networkMappings.warnings);
  }
};

const initCalculatedPerNamespaceSlice =
  (): CreateVmMigrationPageState['calculatedPerNamespace'] => ({
    networkMappings: undefined,
    sourceNetworks: [],
    sourceStorages: [],
    storageMappings: undefined,
    targetNetworks: [],
    targetStorages: [],
  });

const resolveTargetProvider = (name: string, availableProviders: V1beta1Provider[]) =>
  availableProviders.filter(getIsTarget).find((provider) => provider?.metadata?.name === name);

// based on the method used in legacy/src/common/helpers
// and mocks/src/definitions/utils
export type ObjectRef = {
  apiVersion: string;
  kind: string;
  name?: string;
  namespace?: string;
  uid?: string;
};
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
): ObjectRef => ({
  apiVersion,
  kind,
  name,
  namespace,
  uid,
});

export const resourceFieldsForType = (
  type: ProviderType,
): [ResourceField[], FC<RowProps<VmData>>] => {
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
      return [[], DefaultRow];
  }
};

export const addIfMissing = <T>(key: T, keys: T[]) => {
  console.warn('addIfMissing', key, keys);
  if (keys.includes(key)) {
    return;
  }
  keys.push(key);
};

const removeIfPresent = <T>(key: T, keys: T[]) => {
  console.warn('removeIfPresent', key, keys);
  const index = keys?.findIndex((val) => val === key);
  if (index === undefined || index === -1) {
    return;
  }
  keys.splice(index, 1);
};

export const alreadyInUseBySelectedVms = ({
  namespace,
  namespacesUsedBySelectedVms,
  sourceProvider,
  targetProvider,
}: {
  namespace: string;
  sourceProvider: V1beta1Provider;
  targetProvider: V1beta1Provider;
  namespacesUsedBySelectedVms: string[];
}) =>
  sourceProvider.spec?.url === targetProvider?.spec?.url &&
  sourceProvider.spec?.type === 'openshift' &&
  namespacesUsedBySelectedVms.some((name) => name === namespace);

const validateNetworkMapping = ({
  errors,
  mappings,
  nicProfiles,
  selectedVms,
  sourceNetworkLabelToId,
  sources,
}: {
  sources: MappingSource[];
  errors: NetworkAlerts[];
  mappings: Mapping[];
  selectedVms: VmData[];
  sourceNetworkLabelToId: Record<string, string>;
  nicProfiles?: OVirtNicProfile[];
}): [boolean, NetworkAlerts][] => [
  [sources.some((src) => src.usedBySelectedVms && !src.isMapped), UNMAPPED_NETWORKS],
  [errors.includes(OVIRT_NICS_WITH_EMPTY_PROFILE), OVIRT_NICS_WITH_EMPTY_PROFILE],
  [
    hasMultiplePodNetworkMappings(mappings, selectedVms, sourceNetworkLabelToId, nicProfiles),
    MULTIPLE_NICS_MAPPED_TO_POD_NETWORKING,
  ],
];

export const executeNetworkMappingValidation = (draft: Draft<CreateVmMigrationPageState>) => {
  const {
    alerts: {
      networkMappings: { errors },
    },
    calculatedOnce: { sourceNetworkLabelToId },
    calculatedPerNamespace: cpn,
    existingResources: { nicProfiles },
    receivedAsParams: { selectedVms },
    validation,
  } = draft;
  validation.networkMappings = validateNetworkMapping({
    errors,
    mappings: cpn.networkMappings,
    nicProfiles,
    selectedVms,
    sourceNetworkLabelToId,
    sources: cpn.sourceNetworks,
  }).reduce((validation, [hasFailed, alert]) => {
    hasFailed ? addIfMissing(alert, errors) : removeIfPresent(alert, errors);
    return hasFailed ? 'error' : validation;
  }, 'default');
};

const validateStorageMapping = ({
  sources,
}: {
  sources: MappingSource[];
}): [boolean, StorageAlerts][] => [
  [sources.some((src) => src.usedBySelectedVms && !src.isMapped), UNMAPPED_STORAGES],
];

export const executeStorageMappingValidation = (draft: Draft<CreateVmMigrationPageState>) => {
  const {
    alerts: {
      storageMappings: { errors },
    },
    calculatedPerNamespace: cpn,
    validation,
  } = draft;
  validation.storageMappings = validateStorageMapping({ sources: cpn.sourceStorages }).reduce(
    (validation, [hasFailed, alert]) => {
      hasFailed ? addIfMissing(alert, errors) : removeIfPresent(alert, errors);
      return hasFailed ? 'error' : validation;
    },
    'default',
  );
};

export const isDone = (initialLoading: Partial<Record<CreateVmMigration, boolean>>) =>
  Object.values(initialLoading).every((value) => value);
