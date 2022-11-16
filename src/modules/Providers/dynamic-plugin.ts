import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  ProvidersPage: './modules/Providers/ProvidersWrapper',
};

export const extensions: EncodedExtension[] = [
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
];
