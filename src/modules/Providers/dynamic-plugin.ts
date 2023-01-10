import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import {
  ActionProvider,
  ResourceListPage,
  ResourceNSNavItem,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  ProvidersPage: './modules/Providers/ProvidersWrapper',
  HostsPage: './modules/Providers/HostsPageWrapper',
  useMergedProviders: './modules/Providers/UseMergedProviders',
};

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/resource-ns',
    properties: {
      id: 'providers',
      insertAfter: 'importSeparator',
      perspective: 'admin',
      section: 'virtualization',
      // t('plugin__forklift-console-plugin~Providers for Import')
      name: '%plugin__forklift-console-plugin~Providers for Import%',
      model: {
        group: 'forklift.konveyor.io',
        kind: 'Provider',
        version: 'v1beta1',
      },
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-providers',
        'data-test-id': 'providers-nav-item',
      },
    },
  } as EncodedExtension<ResourceNSNavItem>,

  {
    type: 'console.page/resource/list',
    properties: {
      component: {
        $codeRef: 'ProvidersPage',
      },
      model: {
        group: 'forklift.konveyor.io',
        kind: 'Provider',
        version: 'v1beta1',
      },
    },
  } as EncodedExtension<ResourceListPage>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'HostsPage',
      },
      path: ['/mtv/providers/vsphere/ns/:ns/:providerName', '/mtv/providers/vsphere/:providerName'],
      exact: false,
    },
  } as EncodedExtension<RoutePage>,

  {
    type: 'console.action/provider',
    properties: {
      contextId: 'forklift-merged-provider',
      provider: {
        $codeRef: 'useMergedProviders',
      },
    },
  } as EncodedExtension<ActionProvider>,
];
