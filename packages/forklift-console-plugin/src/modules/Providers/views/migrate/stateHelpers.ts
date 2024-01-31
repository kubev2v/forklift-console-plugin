import { FC } from 'react';
import { Draft } from 'immer';
import { v4 as randomId } from 'uuid';

import {
  DefaultRow,
  ResourceFieldFactory,
  RowProps,
  universalComparator,
  withTr,
} from '@kubev2v/common';
import {
  IoK8sApimachineryPkgApisMetaV1ObjectMeta,
  OpenShiftNamespace,
  ProviderModelGroupVersionKind as ProviderGVK,
  ProviderType,
  V1beta1Plan,
  V1beta1Provider,
} from '@kubev2v/types';

import { InventoryNetwork } from '../../hooks/useNetworks';
import { getIsTarget, validateK8sName } from '../../utils';
import { networkMapTemplate, planTemplate, storageMapTemplate } from '../create/templates';
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

import { POD_NETWORK } from './actions';
import { getNetworksUsedBySelectedVms } from './getNetworksUsedBySelectedVMs';
import { CreateVmMigrationPageState } from './reducer';

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
) =>
  validateK8sName(namespace) && availableNamespaces?.find((n) => n.name === namespace)
    ? 'success'
    : 'error';

export const calculateNetworks = (
  draft: Draft<CreateVmMigrationPageState>,
): Partial<CreateVmMigrationPageState['calculatedPerNamespace']> => {
  const {
    existingResources,
    underConstruction: { plan },
    calculatedOnce: { sourceNetworkLabelToId, networkIdsUsedBySelectedVms },
  } = draft;

  const targetNetworkNameToUid = Object.fromEntries(
    existingResources.targetNetworks
      .filter(({ namespace }) => namespace === plan.spec.targetNamespace)
      .map((net) => [net.name, net.uid]),
  );
  const targetNetworkLabels = [
    POD_NETWORK,
    ...Object.keys(targetNetworkNameToUid).sort((a, b) => universalComparator(a, b, 'en')),
  ];
  const defaultDestination = POD_NETWORK;

  const sourceNetworks = Object.keys(sourceNetworkLabelToId)
    .sort((a, b) => universalComparator(a, b, 'en'))
    .map((label) => {
      const usedBySelectedVms = networkIdsUsedBySelectedVms.some(
        (id) => id === sourceNetworkLabelToId[label],
      );
      return {
        label,
        usedBySelectedVms,
        isMapped: usedBySelectedVms,
      };
    });

  return {
    targetNetworks: targetNetworkLabels,
    sourceNetworks,
    networkMappings: sourceNetworks
      .filter(({ usedBySelectedVms }) => usedBySelectedVms)
      .map(({ label }) => ({
        source: label,
        destination: defaultDestination,
      })),
  };
};

export const calculateStorages = (
  draft: Draft<CreateVmMigrationPageState>,
): Partial<CreateVmMigrationPageState['calculatedPerNamespace']> => ({});

export const setTargetProvider = (
  draft: Draft<CreateVmMigrationPageState>,
  targetProviderName: string,
  availableProviders: V1beta1Provider[],
) => {
  const {
    existingResources,
    validation,
    underConstruction: { plan, netMap, storageMap },
    workArea,
  } = draft;

  // reset props that depend on the target provider
  plan.spec.targetNamespace = undefined;
  // temporarily assume no namespace is OK - the validation will continue when new namespaces are loaded
  validation.targetNamespace = 'default';
  existingResources.targetNamespaces = [];
  existingResources.targetNetworks = [];
  existingResources.targetStorages = [];
  draft.calculatedPerNamespace = initCalculatedPerNamespaceSlice();

  // there might be no target provider in the namespace
  const resolvedTarget = resolveTargetProvider(targetProviderName, availableProviders);
  validation.targetProvider = resolvedTarget ? 'success' : 'error';
  plan.spec.provider.destination = resolvedTarget && getObjectRef(resolvedTarget);
  netMap.spec.provider.destination = resolvedTarget && getObjectRef(resolvedTarget);
  storageMap.spec.provider.destination = resolvedTarget && getObjectRef(resolvedTarget);
  workArea.targetProvider = resolvedTarget;
};

export const setTargetNamespace = (
  draft: Draft<CreateVmMigrationPageState>,
  targetNamespace: string,
): void => {
  const {
    underConstruction: { plan },
  } = draft;

  plan.spec.targetNamespace = targetNamespace;
  draft.validation.targetNamespace = validateTargetNamespace(
    targetNamespace,
    draft.existingResources.targetNamespaces,
  );

  draft.calculatedPerNamespace = initCalculatedPerNamespaceSlice();
  draft.calculatedPerNamespace = {
    ...draft.calculatedPerNamespace,
    ...calculateNetworks(draft),
    ...calculateStorages(draft),
  };
};

export const initCalculatedPerNamespaceSlice =
  (): CreateVmMigrationPageState['calculatedPerNamespace'] => ({
    targetNetworks: [],
    targetStorages: [],
    networkMappings: [],
    storageMappings: [],
    sourceStorages: [],
    sourceNetworks: [],
    targetNetworkLabelToId: {},
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

export const createInitialState = ({
  namespace,
  sourceProvider = {
    metadata: { name: 'unknown', namespace: 'unknown' },
    apiVersion: `${ProviderGVK.group}/${ProviderGVK.version}`,
    kind: ProviderGVK.kind,
  },
  selectedVms = [],
}: {
  namespace: string;
  sourceProvider: V1beta1Provider;
  selectedVms: VmData[];
}): CreateVmMigrationPageState => ({
  underConstruction: {
    plan: {
      ...planTemplate,
      metadata: {
        ...planTemplate?.metadata,
        name: generateName(sourceProvider.metadata.name),
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
    netMap: {
      ...networkMapTemplate,
      metadata: {
        ...networkMapTemplate?.metadata,
        name: generateName(sourceProvider.metadata.name),
        namespace,
      },
      spec: {
        ...networkMapTemplate?.spec,
        provider: {
          source: getObjectRef(sourceProvider),
          destination: undefined,
        },
      },
    },
    storageMap: {
      ...storageMapTemplate,
      metadata: {
        ...storageMapTemplate?.metadata,
        name: generateName(sourceProvider.metadata.name),
        namespace,
      },
      spec: {
        ...storageMapTemplate?.spec,
        provider: {
          source: getObjectRef(sourceProvider),
          destination: undefined,
        },
      },
    },
  },

  existingResources: {
    plans: [],
    providers: [],
    targetNamespaces: [],
    targetNetworks: [],
    sourceNetworks: [],
    targetStorages: [],
    nickProfiles: [],
    netMaps: [],
    createdNetMap: undefined,
  },
  receivedAsParams: {
    selectedVms,
    sourceProvider,
    namespace,
  },
  validation: {
    planName: 'default',
    targetNamespace: 'default',
    targetProvider: 'default',
  },
  calculatedOnce: {
    vmFieldsFactory: resourceFieldsForType(sourceProvider?.spec?.type as ProviderType),
    networkIdsUsedBySelectedVms:
      sourceProvider.spec?.type !== 'ovirt' ? getNetworksUsedBySelectedVms(selectedVms, []) : [],
    sourceNetworkLabelToId: {},
    storagesUsedBySelectedVms: [],
    // storagesUsedBySelectedVms: ['ovirt', 'openstack'].includes(sourceProvider.spec?.type) ? [] : [],
  },
  calculatedPerNamespace: {
    targetNetworks: [],
    targetNetworkLabelToId: {},
    targetStorages: [],
    sourceNetworks: [],
    networkMappings: [],
    sourceStorages: [],
    storageMappings: [],
  },
  workArea: {
    targetProvider: undefined,
  },
  flow: {
    editingDone: false,
    validationError: undefined,
    apiError: undefined,
  },
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

export const mapSourceNetworksToLabels = (
  sources: InventoryNetwork[],
): { [label: string]: string } => {
  const tuples = sources
    .map((net) => {
      switch (net.providerType) {
        case 'openshift': {
          return [`${net.namespace}/${net.name}`, net.uid];
        }
        case 'openstack': {
          return [net.name, net.id];
        }
        case 'ovirt': {
          return [net.path, net.id];
        }
        case 'vsphere': {
          return [net.name, net.id];
        }
        default: {
          return undefined;
        }
      }
    })
    .filter(Boolean);
  const labelToId: { [label: string]: string } = tuples.reduce((acc, [label, id]) => {
    if (acc[label] === id) {
      //already included - no collisions
      return acc;
    } else if (acc[withSuffix(label, id)] === id) {
      //already included with suffix - there was a collision before
      return acc;
    } else if (acc[label]) {
      // resolve conflict
      return {
        ...acc,
        // existing entry: add suffix with ID
        [label]: undefined,
        [withSuffix(label, acc[label])]: acc[label],
        // new entry: create with suffix
        [withSuffix(label, id)]: id,
      };
    } else {
      // happy path
      return {
        ...acc,
        [label]: id,
      };
    }
  }, {});

  return labelToId;
};

const withSuffix = (label: string, id: string) => `${label}  (ID: ${id}})`;
