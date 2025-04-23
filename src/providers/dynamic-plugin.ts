import { ProviderModelGroupVersionKind } from '@kubev2v/types';
import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type { ResourceListPage, ResourceNSNavItem } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ProvidersListPage: '/src/providers/list/ProvidersListPage',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-providers-new',
        'data-testid': 'providers-nav-item-new',
      },
      id: 'providers-ng-new',
      model: ProviderModelGroupVersionKind,
      name: '%plugin__forklift-console-plugin~Providers (new)%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,

  {
    properties: {
      component: {
        $codeRef: 'ProvidersListPage',
      },
      model: ProviderModelGroupVersionKind,
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
];
