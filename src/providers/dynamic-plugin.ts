import { ProviderModelGroupVersionKind } from '@forklift-ui/types';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ProviderDetailsPage: './providers/details/ProviderDetailsPage',
  ProvidersCreatePage: './providers/create/ProvidersCreatePage',
  ProvidersListPage: './providers/list/ProvidersListPage',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-providers',
        'data-testid': 'providers-nav-item',
      },
      id: 'providers',
      insertAfter: ['forkliftSettings', 'importSeparator'],
      model: ProviderModelGroupVersionKind,
      name: '%plugin__forklift-console-plugin~Providers%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-providers-virt-perspective',
        'data-testid': 'providers-virt-perspective-nav-item',
      },
      id: 'providers-virt-perspective',
      insertAfter: 'forkliftSettings-virt-perspective',
      model: ProviderModelGroupVersionKind,
      name: '%plugin__forklift-console-plugin~Providers%',
      perspective: 'virtualization-perspective',
      section: 'migration-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },

  {
    properties: {
      component: {
        $codeRef: 'ProvidersListPage',
      },
      model: ProviderModelGroupVersionKind,
    },
    type: 'console.page/resource/list',
  },
  {
    properties: {
      component: {
        $codeRef: 'ProviderDetailsPage',
      },
      model: ProviderModelGroupVersionKind,
    },
    type: 'console.page/resource/details',
  },

  {
    properties: {
      model: ProviderModelGroupVersionKind,
    },
    type: 'console.model-metadata',
  },

  {
    properties: {
      component: {
        $codeRef: 'ProvidersCreatePage',
      },
      model: ProviderModelGroupVersionKind,
    },
    type: 'console.resource/create',
  },
];
