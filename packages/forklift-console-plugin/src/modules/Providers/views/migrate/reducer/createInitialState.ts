import {
  ProviderModelGroupVersionKind as ProviderGVK,
  ProviderType,
  V1beta1Provider,
} from '@kubev2v/types';

import { networkMapTemplate, planTemplate, storageMapTemplate } from '../../create/templates';
import { toId, VmData } from '../../details';
import { CreateVmMigrationPageState } from '../types';

import { getNamespacesUsedBySelectedVms } from './getNamespacesUsedBySelectedVms';
import { getNetworksUsedBySelectedVms } from './getNetworksUsedBySelectedVMs';
import { getStoragesUsedBySelectedVms } from './getStoragesUsedBySelectedVMs';
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
    sourceStorages: [],
    nickProfiles: [],
    disks: [],
    netMaps: [],
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
  alerts: {
    general: {
      errors: [],
      warnings: [],
    },
    networkMappings: {
      errors: [],
      warnings: [],
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
      sourceProvider.spec?.type === 'openshift' ? getNamespacesUsedBySelectedVms(selectedVms) : [],
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
    disksLoaded: false,
    nicProfilesLoaded: false,
    sourceNetworkLoaded: false,
    sourceStoragesLoaded: false,
    targetNetworksLoaded: false,
    targetStoragesLoaded: false,
  },
});
