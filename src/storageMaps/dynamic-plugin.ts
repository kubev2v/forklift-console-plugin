import { StorageMapModel, StorageMapModelGroupVersionKind } from '@forklift-ui/types';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  StorageMapCreatePage: './storageMaps/create/StorageMapCreatePage',
  StorageMapDetailsPage: './storageMaps/details/StorageMapDetailsPage',
  StorageMapsListPage: './storageMaps/list/StorageMapsListPage',
  yamlTemplate: './storageMaps/yamlTemplates/defaultYamlTemplate.ts',
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
  },
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
  },

  {
    properties: {
      component: {
        $codeRef: 'StorageMapsListPage',
      },
      model: StorageMapModelGroupVersionKind,
    },
    type: 'console.page/resource/list',
  },

  {
    properties: {
      component: {
        $codeRef: 'StorageMapDetailsPage',
      },
      model: StorageMapModelGroupVersionKind,
    },
    type: 'console.page/resource/details',
  },

  {
    properties: {
      component: { $codeRef: 'StorageMapCreatePage' },
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
  },

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
