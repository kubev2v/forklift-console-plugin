import { NetworkMapModel, NetworkMapModelGroupVersionKind } from '@kubev2v/types';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import {
  ModelMetadata,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  NetworkMapsListPage: './modules/NetworkMaps/views/list/NetworkMapsListPage',
  NetworkMapDetailsPage: './modules/NetworkMaps/views/details/NetworkMapDetailsPage',
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
        $codeRef: 'NetworkMapsListPage',
      },
      model: NetworkMapModelGroupVersionKind,
    },
  } as EncodedExtension<ResourceListPage>,

  {
    type: 'console.page/resource/details',
    properties: {
      component: {
        $codeRef: 'NetworkMapDetailsPage',
      },
      model: NetworkMapModelGroupVersionKind,
    },
  } as EncodedExtension<ResourceDetailsPage>,

  {
    type: 'console.model-metadata',
    properties: {
      model: NetworkMapModelGroupVersionKind,
      ...NetworkMapModel,
    },
  } as EncodedExtension<ModelMetadata>,
];
