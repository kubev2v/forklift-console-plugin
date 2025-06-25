import type {
  ContextProvider,
  HrefNavItem,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  OverviewContext: './overview/hooks/OverviewContext',
  OverviewPage: './overview/OverviewPage',
  useOverviewContext: './overview/hooks/useOverviewContext',
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
      path: ['/mtv/overview'],
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
      href: '/mtv/overview',
      id: 'forkliftSettings',
      insertAfter: 'importSeparator',
      // t('plugin__forklift-console-plugin~Overview')
      name: '%plugin__forklift-console-plugin~Overview%',
      namespaced: false,
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
  {
    properties: {
      provider: { $codeRef: 'OverviewContext.CreateOverviewContextProvider' },
      useValueHook: {
        $codeRef: 'useOverviewContext.useOverviewContext',
      },
    },
    type: 'console.context-provider',
  } as EncodedExtension<ContextProvider>,
];
