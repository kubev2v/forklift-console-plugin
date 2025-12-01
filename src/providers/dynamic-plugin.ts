import { ProviderModelGroupVersionKind } from '@kubev2v/types';
import type {
  CreateResource,
  ModelMetadata,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceNSNavItem,
  RoutePage,
} from '@openshift-console/dynamic-plugin-sdk';
import type {
  ConsolePluginBuildMetadata,
  EncodedExtension,
} from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ProviderDetailsPage: './providers/details/ProviderDetailsPage',
  ProvidersCreateNewPage: './providers/create-new/ProvidersCreatePage',
  ProvidersCreatePage: './providers/create/ProvidersCreatePage',
  ProvidersListPage: './providers/list/ProvidersListPage',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-providers',
        'data-testid': 'providers-nav-item',
      },
      id: 'providers',
      insertAfter: ['forkliftSettings', 'importSeparator'],
      model: ProviderModelGroupVersionKind,
      name: '%plugin__forklift-console-plugin~Providers%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-providers-virt-perspective',
        'data-testid': 'providers-virt-perspective-nav-item',
      },
      id: 'providers-virt-perspective',
      insertAfter: 'forkliftSettings-virt-perspective',
      model: ProviderModelGroupVersionKind,
      name: '%plugin__forklift-console-plugin~Providers%',
      perspective: 'virtualization-perspective',
      section: 'migration-virt-perspective',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,

  {
    properties: {
      component: {
        $codeRef: 'ProvidersListPage',
      },
      model: ProviderModelGroupVersionKind,
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,
  {
    properties: {
      component: {
        $codeRef: 'ProviderDetailsPage',
      },
      model: ProviderModelGroupVersionKind,
    },
    type: 'console.page/resource/details',
  } as EncodedExtension<ResourceDetailsPage>,

  {
    properties: {
      model: ProviderModelGroupVersionKind,
    },
    type: 'console.model-metadata',
  } as EncodedExtension<ModelMetadata>,

  {
    properties: {
      component: {
        $codeRef: 'ProvidersCreatePage',
      },
      model: ProviderModelGroupVersionKind,
    },
    type: 'console.resource/create',
  } as EncodedExtension<CreateResource>,

  {
    properties: {
      component: {
        $codeRef: 'ProvidersCreateNewPage',
      },
      exact: true,
      path: '/k8s/providers/create',
    },
    type: 'console.page/route',
  } as EncodedExtension<RoutePage>,
];
