import {
  ProviderModelGroupVersionKind as ProviderGVK,
  type ProviderType,
  type V1beta1Provider,
} from '@kubev2v/types';

import { networkMapTemplate, planTemplate, storageMapTemplate } from '../../create/templates';
import { toId, type VmData } from '../../details';
import {
  type CreateVmMigrationPageState,
  MULTIPLE_NICS_ON_THE_SAME_NETWORK,
  OVIRT_NICS_WITH_EMPTY_PROFILE,
} from '../types';

import { SET_DISKS, SET_NICK_PROFILES } from './actions';
import { getNamespacesUsedBySelectedVms } from './getNamespacesUsedBySelectedVms';
import { getNetworksUsedBySelectedVms } from './getNetworksUsedBySelectedVMs';
import { getStoragesUsedBySelectedVms } from './getStoragesUsedBySelectedVMs';
import { hasMultipleNicsOnTheSameNetwork } from './hasMultipleNicsOnTheSameNetwork';
import { hasNicWithEmptyProfile } from './hasNicWithEmptyProfile';
import { getObjectRef, resourceFieldsForType } from './helpers';

export type InitialStateParameters = {
  namespace: string;
  sourceProvider: V1beta1Provider;
  selectedVms: VmData[];
  planName: string;
  projectName: string;
};

export const createInitialState = ({
  namespace,
  planName = '',
  projectName,
  selectedVms = [],
  sourceProvider = {
    apiVersion: `${ProviderGVK.group}/${ProviderGVK.version}`,
    kind: ProviderGVK.kind,
    metadata: { name: 'unknown', namespace: 'unknown' },
  },
}: InitialStateParameters): CreateVmMigrationPageState => {
  const hasVmNicWithEmptyProfile = hasNicWithEmptyProfile(sourceProvider, selectedVms);

  return {
    alerts: {
      networkMappings: {
        errors: hasVmNicWithEmptyProfile ? [OVIRT_NICS_WITH_EMPTY_PROFILE] : [],
        warnings: hasMultipleNicsOnTheSameNetwork(selectedVms)
          ? [MULTIPLE_NICS_ON_THE_SAME_NETWORK]
          : [],
      },
      storageMappings: {
        errors: [],
        warnings: [],
      },
    },

    calculatedOnce: {
      namespacesUsedBySelectedVms:
        sourceProvider.spec?.type === 'openshift'
          ? getNamespacesUsedBySelectedVms(selectedVms)
          : [],
      networkIdsUsedBySelectedVms:
        sourceProvider.spec?.type !== 'ovirt' ? getNetworksUsedBySelectedVms(selectedVms, []) : [],
      sourceNetworkLabelToId: {},
      sourceStorageLabelToId: {},
      storageIdsUsedBySelectedVms: ['ovirt', 'openstack'].includes(sourceProvider.spec?.type)
        ? []
        : getStoragesUsedBySelectedVms({}, selectedVms, []),
      vmFieldsFactory: resourceFieldsForType(sourceProvider?.spec?.type as ProviderType),
    },
    calculatedPerNamespace: {
      networkMappings: undefined,
      sourceNetworks: [],
      sourceStorages: [],
      storageMappings: undefined,
      targetNetworks: [],
      targetStorages: [],
    },
    existingResources: {
      disks: [],
      netMaps: [],
      nicProfiles: [],
      plans: [],
      providers: [],
      sourceNetworks: [],
      sourceStorages: [],
      storageMaps: [],
      targetNamespaces: [],
      targetNetworks: [],
      targetStorages: [],
    },
    flow: {
      apiError: undefined,
      editingDone: false,
      initialLoading: {
        [SET_DISKS]: !['ovirt', 'openstack'].includes(sourceProvider.spec?.type),
        [SET_NICK_PROFILES]: sourceProvider.spec?.type !== 'ovirt',
      },
    },
    receivedAsParams: {
      namespace,
      selectedVms,
      sourceProvider,
    },
    underConstruction: {
      netMap: {
        ...networkMapTemplate,
        metadata: {
          ...networkMapTemplate?.metadata,
          generateName: `${sourceProvider.metadata.name}-`,
          namespace,
        },
        spec: {
          ...networkMapTemplate?.spec,
          provider: {
            destination: undefined,
            source: getObjectRef(sourceProvider),
          },
        },
      },
      plan: {
        ...planTemplate,
        metadata: {
          ...planTemplate?.metadata,
          name: planName,
          namespace,
        },
        spec: {
          ...planTemplate?.spec,
          provider: {
            destination: undefined,
            source: getObjectRef(sourceProvider),
          },
          targetNamespace: namespace,
          vms: selectedVms.map((data) => ({
            id: toId(data),
            name: data.name,
            namespace: data.namespace,
          })),
        },
      },
      projectName,
      storageMap: {
        ...storageMapTemplate,
        metadata: {
          ...storageMapTemplate?.metadata,
          generateName: `${sourceProvider.metadata.name}-`,
          namespace,
        },
        spec: {
          ...storageMapTemplate?.spec,
          provider: {
            destination: undefined,
            source: getObjectRef(sourceProvider),
          },
        },
      },
    },
    validation: {
      networkMappings: hasVmNicWithEmptyProfile ? 'error' : 'default',
      planName: 'default',
      projectName: 'default',
      storageMappings: 'default',
      targetNamespace: 'default',
      targetProvider: 'default',
    },
    workArea: {
      targetProvider: undefined,
    },
  };
};
