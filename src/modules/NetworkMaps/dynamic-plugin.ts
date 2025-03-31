import { NetworkMapModel, NetworkMapModelGroupVersionKind } from '@kubev2v/types';
import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type {
  ModelMetadata,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  NetworkMapDetailsPage: './modules/NetworkMaps/views/details/NetworkMapDetailsPage',
  NetworkMapsListPage: './modules/NetworkMaps/views/list/NetworkMapsListPage',
  yamlTemplates: './modules/NetworkMaps/yamlTemplates',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-network-mappings',
        'data-testid': 'network-mappings-nav-item',
      },
      id: 'networkMappings',
      insertAfter: 'plans',
      model: NetworkMapModelGroupVersionKind,
      // t('plugin__forklift-console-plugin~NetworkMaps for virtualization')
      name: '%plugin__forklift-console-plugin~NetworkMaps for virtualization%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,

  {
    properties: {
      component: {
        $codeRef: 'NetworkMapsListPage',
      },
      model: NetworkMapModelGroupVersionKind,
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,

  {
    properties: {
      component: {
        $codeRef: 'NetworkMapDetailsPage',
      },
      model: NetworkMapModelGroupVersionKind,
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,

  {
    properties: {
      model: NetworkMapModelGroupVersionKind,
      ...NetworkMapModel,
    },
    type: 'console.model-metadata',
  } as EncodedExtension<ModelMetadata>,

  {
    properties: {
      model: NetworkMapModelGroupVersionKind,
      name: 'default',
      ...NetworkMapModel,
      template: { $codeRef: 'yamlTemplates.defaultYamlTemplate' },
    },
    type: 'console.yaml-template',
  },
];
