import { NetworkMapModel, NetworkMapModelGroupVersionKind } from '@kubev2v/types';
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
  NetworkMapCreatePage: './networkMaps/create/NetworkMapCreatePage',
  NetworkMapDetailsPage: './modules/NetworkMaps/views/details/NetworkMapDetailsPage',
  NetworkMapsListPage: './modules/NetworkMaps/views/list/NetworkMapsListPage',
  yamlTemplate: './modules/NetworkMaps/yamlTemplates/defaultYamlTemplate.ts',
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
      // t('plugin__forklift-console-plugin~Network maps')
      name: '%plugin__forklift-console-plugin~Network maps%',
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
      component: { $codeRef: 'NetworkMapCreatePage' },
      exact: true,
      path: `/k8s/networkMaps/create/form`,
    },
    type: 'console.page/route',
  },

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
      template: { $codeRef: 'yamlTemplate' },
    },
    type: 'console.yaml-template',
  },
];
