import { PlanModel, PlanModelGroupVersionKind } from '@forklift-ui/types';
import type {
  CreateResource,
  ModelMetadata,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
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
  } as EncodedExtension<ResourceNSNavItem>,
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
        $codeRef: 'PlanDetailsNav',
      },
      model: PlanModelGroupVersionKind,
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,

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
      model: PlanModelGroupVersionKind,
      ...PlanModel,
    },
    type: 'console.model-metadata',
  } as EncodedExtension<ModelMetadata>,
];
