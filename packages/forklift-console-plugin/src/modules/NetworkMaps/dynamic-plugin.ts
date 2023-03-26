import { NetworkMapModel, NetworkMapModelGroupVersionKind } from '@kubev2v/types';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import {
  ActionProvider,
  ModelMetadata,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  NetworkMappingsPage: './modules/NetworkMaps/NetworkMappingsWrapper',
  useNetworkMappingActions: './modules/NetworkMaps/UseNetworkMappingActions',
};

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/resource-ns',
    properties: {
      id: 'networkMappings',
      insertAfter: 'plans',
      perspective: 'admin',
      section: 'migration',
      // t('plugin__forklift-console-plugin~NetworkMaps for virtualization')
      name: '%plugin__forklift-console-plugin~NetworkMaps for virtualization%',
      model: NetworkMapModelGroupVersionKind,
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-network-mappings',
        'data-testid': 'network-mappings-nav-item',
      },
    },
  } as EncodedExtension<ResourceNSNavItem>,

  {
    type: 'console.page/resource/list',
    properties: {
      component: {
        $codeRef: 'NetworkMappingsPage',
      },
      model: NetworkMapModelGroupVersionKind,
    },
  } as EncodedExtension<ResourceListPage>,
  {
    type: 'console.action/provider',
    properties: {
      contextId: 'forklift-flat-network-mapping',
      provider: {
        $codeRef: 'useNetworkMappingActions',
      },
    },
  } as EncodedExtension<ActionProvider>,

  {
    type: 'console.model-metadata',
    properties: {
      model: NetworkMapModelGroupVersionKind,
      ...NetworkMapModel,
    },
  } as EncodedExtension<ModelMetadata>,
];
