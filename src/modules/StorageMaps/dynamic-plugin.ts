import { StorageMapModel, StorageMapModelGroupVersionKind } from '@kubev2v/types';
import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type {
  ModelMetadata,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  StorageMapDetailsPage: './modules/StorageMaps/views/details/StorageMapDetailsPage',
  StorageMapsListPage: './modules/StorageMaps/views/list/StorageMapsListPage',
  yamlTemplates: './modules/StorageMaps/yamlTemplates',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storage-mappings',
        'data-testid': 'storage-mappings-nav-item',
      },
      id: 'StorageMappings',
      insertAfter: 'plans',
      model: StorageMapModelGroupVersionKind,
      // t('plugin__forklift-console-plugin~StorageMaps for virtualization')
      name: '%plugin__forklift-console-plugin~StorageMaps for virtualization%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,

  {
    properties: {
      component: {
        $codeRef: 'StorageMapsListPage',
      },
      model: StorageMapModelGroupVersionKind,
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,

  {
    properties: {
      component: {
        $codeRef: 'StorageMapDetailsPage',
      },
      model: StorageMapModelGroupVersionKind,
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,

  {
    properties: {
      model: StorageMapModelGroupVersionKind,
      ...StorageMapModel,
    },
    type: 'console.model-metadata',
  } as EncodedExtension<ModelMetadata>,

  {
    properties: {
      model: StorageMapModelGroupVersionKind,
      name: 'default',
      ...StorageMapModel,
      template: { $codeRef: 'yamlTemplates.defaultYamlTemplate' },
    },
    type: 'console.yaml-template',
  },
];
