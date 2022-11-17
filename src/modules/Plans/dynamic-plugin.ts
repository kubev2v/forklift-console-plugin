import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  PlansPage: './modules/Plans/PlansWrapper',
  PlanWizard: './modules/Plans/PlanWizardWrapper',
  VMMigrationDetails: './modules/Plans/VMMigrationDetailsWrapper',
};

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/href',
    properties: {
      id: 'plans',
      insertAfter: 'providers',
      section: 'virtualization',
      // t('plugin__forklift-console-plugin~Plans for Import')
      name: '%plugin__forklift-console-plugin~Plans for Import%',
      href: '/mtv/plans',
    },
  } as EncodedExtension<HrefNavItem>,

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
];
