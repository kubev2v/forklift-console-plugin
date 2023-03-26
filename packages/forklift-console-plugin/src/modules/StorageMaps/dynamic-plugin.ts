import { StorageMapModel, StorageMapModelGroupVersionKind } from '@kubev2v/types';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import {
  ActionProvider,
  ModelMetadata,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  StorageMappingsPage: './modules/StorageMaps/StorageMappingsWrapper',
  useStorageMappingActions: './modules/StorageMaps/UseStorageMappingActions',
};

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/resource-ns',
    properties: {
      id: 'storageMappings',
      insertAfter: 'networkMappings',
      perspective: 'admin',
      section: 'migration',
      // t('plugin__forklift-console-plugin~StorageMaps for virtualization')
      name: '%plugin__forklift-console-plugin~StorageMaps for virtualization%',
      model: StorageMapModelGroupVersionKind,
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storage-mappings',
        'data-testid': 'storage-mappings-nav-item',
      },
    },
  } as EncodedExtension<ResourceNSNavItem>,

  {
    type: 'console.page/resource/list',
    properties: {
      component: {
        $codeRef: 'StorageMappingsPage',
      },
      model: StorageMapModelGroupVersionKind,
    },
  } as EncodedExtension<ResourceListPage>,
  {
    type: 'console.action/provider',
    properties: {
      contextId: 'forklift-flat-storage-mapping',
      provider: {
        $codeRef: 'useStorageMappingActions',
      },
    },
  } as EncodedExtension<ActionProvider>,
  {
    type: 'console.model-metadata',
    properties: {
      model: StorageMapModelGroupVersionKind,
      ...StorageMapModel,
    },
  } as EncodedExtension<ModelMetadata>,
];
