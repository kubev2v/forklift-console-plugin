import { StorageMapModel, StorageMapModelGroupVersionKind } from '@kubev2v/types';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  ModelMetadata,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  StorageMapsListPage: './modules/StorageMaps/views/list/StorageMapsListPage',
  StorageMapDetailsPage: './modules/StorageMaps/views/details/StorageMapDetailsPage',
  yamlTemplates: './modules/StorageMaps/yamlTemplates',
};

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/resource-ns',
    properties: {
      id: 'StorageMappings',
      insertAfter: 'plans',
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
        $codeRef: 'StorageMapsListPage',
      },
      model: StorageMapModelGroupVersionKind,
    },
  } as EncodedExtension<ResourceListPage>,

  {
    type: 'console.page/resource/details',
    properties: {
      component: {
        $codeRef: 'StorageMapDetailsPage',
      },
      model: StorageMapModelGroupVersionKind,
    },
  } as EncodedExtension<ResourceDetailsPage>,

  {
    type: 'console.model-metadata',
    properties: {
      model: StorageMapModelGroupVersionKind,
      ...StorageMapModel,
    },
  } as EncodedExtension<ModelMetadata>,

  {
    type: 'console.yaml-template',
    properties: {
      name: 'default',
      model: StorageMapModelGroupVersionKind,
      ...StorageMapModel,
      template: { $codeRef: 'yamlTemplates.defaultYamlTemplate' },
    },
  },
];
