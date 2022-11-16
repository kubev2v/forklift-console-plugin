import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  HostsPage: './modules/Hosts/HostsPageWrapper',
};

export const extensions: EncodedExtension[] = [
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
