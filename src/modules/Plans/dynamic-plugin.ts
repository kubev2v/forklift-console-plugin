import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import {
  ActionProvider,
  ModelMetadata,
  ResourceListPage,
  ResourceNSNavItem,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  PlansPage: './modules/Plans/PlansWrapper',
  PlanWizard: './modules/Plans/PlanWizardWrapper',
  VMMigrationDetails: './modules/Plans/VMMigrationDetailsWrapper',
  usePlanActions: './modules/Plans/UsePlanActions',
};

const model = {
  group: 'forklift.konveyor.io',
  kind: 'Plan',
  version: 'v1beta1',
};

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/resource-ns',
    properties: {
      id: 'plans',
      insertAfter: 'providers',
      perspective: 'admin',
      section: 'virtualization',
      // t('plugin__forklift-console-plugin~Plans for Import')
      name: '%plugin__forklift-console-plugin~Plans for Import%',
      model,
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-plans',
        'data-test-id': 'plans-nav-item',
      },
    },
  } as EncodedExtension<ResourceNSNavItem>,

  {
    type: 'console.page/resource/list',
    properties: {
      component: {
        $codeRef: 'PlansPage',
      },
      model,
    },
  } as EncodedExtension<ResourceListPage>,

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
    type: 'console.action/provider',
    properties: {
      contextId: 'forklift-flat-plan',
      provider: {
        $codeRef: 'usePlanActions',
      },
    },
  } as EncodedExtension<ActionProvider>,

  {
    type: 'console.model-metadata',
    properties: {
      model,
      color: '#0f930b',
      abbr: 'PL',
    },
  } as EncodedExtension<ModelMetadata>,
];
