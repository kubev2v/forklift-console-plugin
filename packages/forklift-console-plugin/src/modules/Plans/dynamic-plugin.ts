import { PlanModel, PlanModelGroupVersionKind } from '@kubev2v/types';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import {
  CreateResource,
  ModelMetadata,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  PlansListPage: './modules/Plans/views/list/PlansListPage',
  PlanCreatePage: './modules/Plans/views/create/PlanCreatePage',
  PlanDetailsPage: './modules/Plans/views/details/PlanDetailsPage',
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
        $codeRef: 'PlansListPage',
      },
      model: PlanModelGroupVersionKind,
    },
  } as EncodedExtension<ResourceListPage>,

  {
    type: 'console.page/resource/details',
    properties: {
      component: {
        $codeRef: 'PlanDetailsPage',
      },
      model: PlanModelGroupVersionKind,
    },
  } as EncodedExtension<ResourceDetailsPage>,

  {
    type: 'console.resource/create',
    properties: {
      component: {
        $codeRef: 'PlanCreatePage',
      },
      model: PlanModelGroupVersionKind,
      ...PlanModel,
    },
  } as EncodedExtension<CreateResource>,

  {
    type: 'console.model-metadata',
    properties: {
      model: PlanModelGroupVersionKind,
      ...PlanModel,
    },
  } as EncodedExtension<ModelMetadata>,
];
