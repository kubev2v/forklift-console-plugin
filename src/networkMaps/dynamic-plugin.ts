import { NetworkMapModel, NetworkMapModelGroupVersionKind } from '@forklift-ui/types';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  NetworkMapCreatePage: './networkMaps/create/NetworkMapCreatePage',
  NetworkMapDetailsPage: './networkMaps/details/NetworkMapDetailsPage',
  NetworkMapsListPage: './networkMaps/list/NetworkMapsListPage',
  yamlTemplate: './networkMaps/yamlTemplates/defaultYamlTemplate.ts',
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
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-network-mappings-virt-perspective',
        'data-testid': 'network-mappings-virt-perspective-nav-item',
      },
      id: 'networkMappings-virt-perspective',
      insertAfter: 'plans-virt-perspective',
      model: NetworkMapModelGroupVersionKind,
      // t('plugin__forklift-console-plugin~Network maps')
      name: '%plugin__forklift-console-plugin~Network maps%',
      perspective: 'virtualization-perspective',
      section: 'migration-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },

  {
    properties: {
      component: {
        $codeRef: 'NetworkMapsListPage',
      },
      model: NetworkMapModelGroupVersionKind,
    },
    type: 'console.page/resource/list',
  },

  {
    properties: {
      component: {
        $codeRef: 'NetworkMapDetailsPage',
      },
      model: NetworkMapModelGroupVersionKind,
    },
    type: 'console.page/resource/details',
  },

  {
    properties: {
      component: { $codeRef: 'NetworkMapCreatePage' },
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
  },

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
