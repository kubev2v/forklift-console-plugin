import { PlanModel, PlanModelGroupVersionKind } from '@forklift-ui/types';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  PlanCreatePage: './plans/create/PlanCreatePage',
  PlanDetailsNav: './plans/details/PlanDetailsNav',
  PlansListPage: './plans/list/PlansListPage',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-plans',
        'data-testid': 'plans-nav-item',
      },
      id: 'plans',
      insertAfter: 'providers',
      model: PlanModelGroupVersionKind,
      // t('plugin__forklift-console-plugin~Migration plans')
      name: '%plugin__forklift-console-plugin~Migration plans%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  },
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-plans-virt-perspective',
        'data-testid': 'plans-virt-perspective-nav-item',
      },
      id: 'plans-virt-perspective',
      insertAfter: 'providers-virt-perspective',
      model: PlanModelGroupVersionKind,
      // t('plugin__forklift-console-plugin~Migration plans')
      name: '%plugin__forklift-console-plugin~Migration plans%',
      perspective: 'virtualization-perspective',
      section: 'migration-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  },

  {
    properties: {
      component: {
        $codeRef: 'PlansListPage',
      },
      model: PlanModelGroupVersionKind,
    },
    type: 'console.page/resource/list',
  },

  {
    properties: {
      component: {
        $codeRef: 'PlanDetailsNav',
      },
      model: PlanModelGroupVersionKind,
    },
    type: 'console.page/resource/details',
  },

  {
    properties: {
      component: {
        $codeRef: 'PlanCreatePage',
      },
      model: PlanModelGroupVersionKind,
      ...PlanModel,
    },
    type: 'console.resource/create',
  },

  {
    properties: {
      model: PlanModelGroupVersionKind,
      ...PlanModel,
    },
    type: 'console.model-metadata',
  },
];
