import { PlanModel, PlanModelGroupVersionKind } from '@kubev2v/types';
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

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/resource-ns',
    properties: {
      id: 'plans',
      insertAfter: 'providers',
      perspective: 'admin',
      section: 'migration',
      // t('plugin__forklift-console-plugin~Plans for virtualization')
      name: '%plugin__forklift-console-plugin~Plans for virtualization%',
      model: PlanModelGroupVersionKind,
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-plans',
        'data-testid': 'plans-nav-item',
      },
    },
  } as EncodedExtension<ResourceNSNavItem>,

  {
    type: 'console.page/resource/list',
    properties: {
      component: {
        $codeRef: 'PlansPage',
      },
      model: PlanModelGroupVersionKind,
    },
  } as EncodedExtension<ResourceListPage>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'PlanWizard',
      },
      path: ['/mtv/plans/ns/:ns/create'],
      exact: false,
    },
  } as EncodedExtension<RoutePage>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'PlanWizard',
      },
      path: ['/mtv/plans/ns/:ns/:planName/edit', '/mtv/plans/ns/:ns/:planName/duplicate'],
      exact: false,
    },
  } as EncodedExtension<RoutePage>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'VMMigrationDetails',
      },
      path: ['/mtv/plans/ns/:ns/:planName'],
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
      model: PlanModelGroupVersionKind,
      ...PlanModel,
    },
  } as EncodedExtension<ModelMetadata>,
];
