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
  OverviewContext: './overview/context/OverviewContext',
  OverviewPage: './overview/OverviewPage',
  useOverviewContext: './overview/hooks/useOverviewContext',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      provider: { $codeRef: 'OverviewContext.OverviewContextProvider' },
      useValueHook: { $codeRef: 'useOverviewContext.useOverviewContext' },
    },
    type: 'console.context-provider',
  } as EncodedExtension<ContextProvider>,
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
    flags: {
      required: ['CAN_LIST_NS'],
    },
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-forklift-overview-virt-perspective',
        'data-testid': 'forklift-overview-virt-perspective-nav-item',
      },
      href: '/mtv/overview',
      id: 'forkliftSettings-virt-perspective',
      // t('plugin__forklift-console-plugin~Overview')
      name: '%plugin__forklift-console-plugin~Overview%',
      namespaced: false,
      perspective: 'virtualization-perspective',
      section: 'migration-virt-perspective',
    },
    type: 'console.navigation/href',
  } as EncodedExtension<HrefNavItem>,
];
