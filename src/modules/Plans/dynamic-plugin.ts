import { PlanModel, PlanModelGroupVersionKind } from '@kubev2v/types';
import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type {
  CreateResource,
  ModelMetadata,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  PlanCreatePage: './modules/Plans/views/create/PlanCreatePage',
  PlanCreatePageV2: './plans/create/PlanCreatePage',
  PlanDetailsPage: './modules/Plans/views/details/PlanDetailsPage',
  // PlanDetailsNav: './plans/details/PlanDetailsNav',
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
      // t('plugin__forklift-console-plugin~Plans for virtualization')
      name: '%plugin__forklift-console-plugin~Plans for virtualization%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,

  {
    properties: {
      component: {
        $codeRef: 'PlansListPage',
      },
      model: PlanModelGroupVersionKind,
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,

  {
    properties: {
      component: {
        $codeRef: 'PlanDetailsPage',
      },
      model: PlanModelGroupVersionKind,
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,

  // {
  //   properties: {
  //     component: {
  //       $codeRef: 'PlanDetailsNav',
  //     },
  //     model: PlanModelGroupVersionKind,
  //   },
  //   type: 'console.page/resource/details',
  // } as EncodedExtension<ResourceDetailsPage>,

  {
    properties: {
      component: {
        $codeRef: 'PlanCreatePage',
      },
      model: PlanModelGroupVersionKind,
      ...PlanModel,
    },
    type: 'console.resource/create',
  } as EncodedExtension<CreateResource>,

  {
    properties: {
      component: {
        $codeRef: 'PlanCreatePageV2',
      },
      exact: false,
      path: ['/mtv/create/plan'],
    },
    type: 'console.page/route',
  },

  {
    properties: {
      model: PlanModelGroupVersionKind,
      ...PlanModel,
    },
    type: 'console.model-metadata',
  } as EncodedExtension<ModelMetadata>,
];
