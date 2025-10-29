import { StorageMapModel, StorageMapModelGroupVersionKind } from '@kubev2v/types';
import type {
  ModelMetadata,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  StorageMapCreatePage: './storageMaps/create/StorageMapCreatePage',
  StorageMapDetailsPage: './modules/StorageMaps/views/details/StorageMapDetailsPage',
  StorageMapsListPage: './modules/StorageMaps/views/list/StorageMapsListPage',
  yamlTemplate: './modules/StorageMaps/yamlTemplates/defaultYamlTemplate.ts',
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
      // t('plugin__forklift-console-plugin~Storage maps')
      name: '%plugin__forklift-console-plugin~Storage maps%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-storage-mappings-virt-perspective',
        'data-testid': 'storage-mappings-virt-perspective-nav-item',
      },
      id: 'StorageMappings-virt-perspective',
      insertAfter: 'plans-virt-perspective',
      model: StorageMapModelGroupVersionKind,
      // t('plugin__forklift-console-plugin~Storage maps')
      name: '%plugin__forklift-console-plugin~Storage maps%',
      perspective: 'virtualization-perspective',
      section: 'migration-virt-perspective',
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
      component: { $codeRef: 'StorageMapCreatePage' },
      exact: true,
      path: `/k8s/storageMaps/create/form`,
    },
    type: 'console.page/route',
  },

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
      template: { $codeRef: 'yamlTemplate' },
    },
    type: 'console.yaml-template',
  },
];
