import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  OverviewPage: './modules/Overview/views/overview/OverviewPage',
};

export const extensions: EncodedExtension[] = [
  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'OverviewPage',
      },
      path: ['/mtv/settings/ns/:ns', '/mtv/settings/all-namespaces'],
      exact: false,
    },
    flags: {
      required: ['CAN_LIST_NS'],
    },
  } as EncodedExtension<RoutePage>,

  {
    type: 'console.navigation/href',
    properties: {
      id: 'forkliftSettings',
      insertAfter: 'importSeparator',
      perspective: 'admin',
      section: 'migration',
      href: '/mtv/settings',
      namespaced: true,
      // t('plugin__forklift-console-plugin~Overview')
      name: '%plugin__forklift-console-plugin~Overview%',
    },
    flags: {
      required: ['CAN_LIST_NS'],
    },
  } as EncodedExtension<HrefNavItem>,
];
