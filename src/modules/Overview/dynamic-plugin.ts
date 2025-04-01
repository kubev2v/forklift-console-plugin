import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type {
  ContextProvider,
  HrefNavItem,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  OverviewContextProvider: './modules/Overview/hooks/OverviewContextProvider',
  OverviewPage: './modules/Overview/views/overview/OverviewPage',
};

export const extensions: EncodedExtension[] = [
  {
    flags: {
      required: ['CAN_LIST_NS'],
    },
    properties: {
      component: {
        $codeRef: 'OverviewPage',
      },
      exact: false,
      path: ['/mtv/settings/ns/:ns', '/mtv/settings/all-namespaces'],
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
  {
    flags: {
      required: ['CAN_LIST_NS'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-forklift-overview',
        'data-testid': 'forklift-overview-nav-item',
      },
      href: '/mtv/settings',
      id: 'forkliftSettings',
      insertAfter: 'importSeparator',
      // T('plugin__forklift-console-plugin~Overview')
      name: '%plugin__forklift-console-plugin~Overview%',
      namespaced: true,
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      provider: { $codeRef: 'OverviewContextProvider.CreateOverviewContextProvider' },
      useValueHook: {
        $codeRef: 'OverviewContextProvider.useOverviewContext',
      },
    },
    type: 'console.context-provider',
  } as EncodedExtension<ContextProvider>,
];
