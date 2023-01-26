import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import {
  ActionProvider,
  HrefNavItem,
  ResourceListPage,
  ResourceNSNavItem,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  MappingsPage: './modules/Mappings/MappingsWrapper',
  NetworkMappingsPage: './modules/Mappings/NetworkMappingsWrapper',
  useNetworkMappingActions: './modules/Mappings/UseNetworkMappingActions',
};

const networkModel = {
  group: 'forklift.konveyor.io',
  kind: 'NetworkMap',
  version: 'v1beta1',
};

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/href',
    properties: {
      id: 'mappings',
      insertAfter: 'plans',
      perspective: 'admin',
      section: 'migration',
      // t('plugin__forklift-console-plugin~Mappings for virtualization')
      name: '%plugin__forklift-console-plugin~Mappings for virtualization%',
      href: '/mtv/mappings',
    },
  } as EncodedExtension<HrefNavItem>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'MappingsPage',
      },
      path: '/mtv/mappings',
      exact: true,
    },
  } as EncodedExtension<RoutePage>,
  {
    type: 'console.navigation/resource-ns',
    properties: {
      id: 'networkMappings',
      insertAfter: 'plans',
      perspective: 'admin',
      section: 'migration',
      // t('plugin__forklift-console-plugin~Network Mappings for virtualization')
      name: '%plugin__forklift-console-plugin~Network Mappings for virtualization%',
      model: networkModel,
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-network-mappings',
        'data-test-id': 'network-mappings-nav-item',
      },
    },
  } as EncodedExtension<ResourceNSNavItem>,

  {
    type: 'console.page/resource/list',
    properties: {
      component: {
        $codeRef: 'NetworkMappingsPage',
      },
      model: networkModel,
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
];
