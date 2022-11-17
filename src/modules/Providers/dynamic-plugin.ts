import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  ProvidersPage: './modules/Providers/ProvidersWrapper',
  HostsPage: './modules/Providers/HostsPageWrapper',
};

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/href',
    properties: {
      id: 'providers',
      insertAfter: 'importSeparator',
      perspective: 'admin',
      section: 'virtualization',
      // t('plugin__forklift-console-plugin~Providers for Import')
      name: '%plugin__forklift-console-plugin~Providers for Import%',
      href: '/mtv/providers',
    },
  } as EncodedExtension<HrefNavItem>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'ProvidersPage',
      },
      path: ['/mtv/providers', '/mtv/providers/:providerType'],
      exact: true,
    },
  } as EncodedExtension<RoutePage>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'HostsPage',
      },
      path: '/mtv/providers/vsphere/:providerName',
      exact: false,
    },
  } as EncodedExtension<RoutePage>,
];
