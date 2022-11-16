import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  PlansPage: './modules/Plans/PlansWrapper',
  PlanWizard: './modules/Plans/PlanWizardWrapper',
};

export const extensions: EncodedExtension[] = [
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
];
