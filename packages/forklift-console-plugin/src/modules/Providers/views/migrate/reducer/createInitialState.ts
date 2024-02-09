import {
  ProviderModelGroupVersionKind as ProviderGVK,
  ProviderType,
  V1beta1Provider,
} from '@kubev2v/types';

import { networkMapTemplate, planTemplate, storageMapTemplate } from '../../create/templates';
import { toId, VmData } from '../../details';
import {
  CreateVmMigrationPageState,
  MULTIPLE_NICS_ON_THE_SAME_NETWORK,
  OVIRT_NICS_WITH_EMPTY_PROFILE,
} from '../types';

import { SET_DISKS, SET_NICK_PROFILES } from './actions';
import { getNamespacesUsedBySelectedVms } from './getNamespacesUsedBySelectedVms';
import { getNetworksUsedBySelectedVms } from './getNetworksUsedBySelectedVMs';
import { getStoragesUsedBySelectedVms } from './getStoragesUsedBySelectedVMs';
import { hasMultipleNicsOnTheSameNetwork } from './hasMultipleNicsOnTheSameNetwork';
import { hasNicWithEmptyProfile } from './hasNicWithEmptyProfile';
import { generateName, getObjectRef, resourceFieldsForType } from './helpers';

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
}): CreateVmMigrationPageState => {
  const hasVmNicWithEmptyProfile = hasNicWithEmptyProfile(sourceProvider, selectedVms);
  return {
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
      sourceStorages: [],
      nicProfiles: [],
      disks: [],
      netMaps: [],
      storageMaps: [],
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
      networkMappings: hasVmNicWithEmptyProfile ? 'error' : 'default',
      storageMappings: 'default',
    },
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
      vmFieldsFactory: resourceFieldsForType(sourceProvider?.spec?.type as ProviderType),
      networkIdsUsedBySelectedVms:
        sourceProvider.spec?.type !== 'ovirt' ? getNetworksUsedBySelectedVms(selectedVms, []) : [],
      sourceNetworkLabelToId: {},
      sourceStorageLabelToId: {},
      storageIdsUsedBySelectedVms: ['ovirt', 'openstack'].includes(sourceProvider.spec?.type)
        ? []
        : getStoragesUsedBySelectedVms(selectedVms, []),
      namespacesUsedBySelectedVms:
        sourceProvider.spec?.type === 'openshift'
          ? getNamespacesUsedBySelectedVms(selectedVms)
          : [],
    },
    calculatedPerNamespace: {
      targetNetworks: [],
      targetStorages: [],
      sourceNetworks: [],
      networkMappings: undefined,
      sourceStorages: [],
      storageMappings: undefined,
    },
    workArea: {
      targetProvider: undefined,
    },
    flow: {
      editingDone: false,
      apiError: undefined,
      initialLoading: {
        [SET_DISKS]: !['ovirt', 'openstack'].includes(sourceProvider.spec?.type),
        [SET_NICK_PROFILES]: sourceProvider.spec?.type !== 'ovirt',
      },
    },
  };
};
