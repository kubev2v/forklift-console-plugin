import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import type {
  HrefNavItem,
  NavSection,
  RoutePage,
  Separator,
} from '@openshift-console/dynamic-plugin-sdk';

const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/section',
    properties: {
      id: 'virtualization',
      name: '%plugin__kubevirt-plugin~Virtualization%',
      insertAfter: 'workloads',
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-virtualization',
        'data-test-id': 'virtualization-nav-item',
      },
    },
    flags: {
      disallowed: ['KUBEVIRT_DYNAMIC'],
    },
  } as EncodedExtension<NavSection>,

  {
    type: 'console.navigation/separator',
    properties: {
      perspective: 'admin',
      section: 'virtualization',
      id: 'importSeparator',
      insertAfter: 'migrationpolicies',
      testID: 'ImportSeparator',
    },
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
  } as EncodedExtension<Separator>,

  {
    type: 'console.navigation/href',
    properties: {
      id: 'providers',
      insertAfter: 'importSeparator',
      perspective: 'admin',
      section: 'virtualization',
      name: '%plugin__forklift-console-plugin~Providers for VM Import%',
      href: '/mtv/providers',
    },
  } as EncodedExtension<HrefNavItem>,

  {
    type: 'console.navigation/href',
    properties: {
      id: 'plans',
      insertAfter: 'providers',
      section: 'virtualization',
      name: '%plugin__forklift-console-plugin~Plans for VM Import%',
      href: '/mtv/plans',
    },
  } as EncodedExtension<HrefNavItem>,

  {
    type: 'console.navigation/href',
    properties: {
      id: 'mappings',
      insertAfter: 'plans',
      perspective: 'admin',
      section: 'virtualization',
      name: '%plugin__forklift-console-plugin~Mappings for VM Import%',
      href: '/mtv/mappings',
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

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'PlansPage',
      },
      path: '/mtv/plans',
      exact: true,
    },
  } as EncodedExtension<RoutePage>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'PlanWizard',
      },
      path: '/mtv/plans/create',
      exact: true,
    },
  } as EncodedExtension<RoutePage>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'PlanWizard',
      },
      path: ['/mtv/plans/:planName/edit', '/mtv/plans/:planName/duplicate'],
      exact: false,
    },
  } as EncodedExtension<RoutePage>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'VMMigrationDetails',
      },
      path: '/mtv/plans/:planName',
      exact: false,
    },
  } as EncodedExtension<RoutePage>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'MappingsPage',
      },
      path: '/mtv/mappings',
      exact: true,
    },
  } as EncodedExtension<RoutePage>,
];

export default extensions;
