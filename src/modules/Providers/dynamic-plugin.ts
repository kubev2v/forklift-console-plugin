import { ProviderModel, ProviderModelGroupVersionKind } from '@kubev2v/types';
import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type {
  ContextProvider,
  CreateResource,
  ModelMetadata,
  ResourceDetailsPage,
  ResourceListPage,
  ResourceNSNavItem,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ProviderDetailsPage: './modules/Providers/views/details/ProviderDetailsPage',
  ProvidersCreatePage: './modules/Providers/views/create/ProvidersCreatePage',
  ProvidersCreateVmMigrationContext:
    './modules/Providers/views/migrate/ProvidersCreateVmMigrationContext',
  ProvidersListPageOld: './modules/Providers/views/list/ProvidersListPageOld',
};

const ProviderModelGroupVersionKind1 = {
  group: 'forklift.konveyor.io',
  kind: 'Provider1',
  version: 'v1beta1',
};

export const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-providers',
        'data-testid': 'providers-nav-item',
      },
      id: 'providers-ng',
      insertAfter: ['forkliftSettings', 'importSeparator'],
      model: ProviderModelGroupVersionKind1,
      // t('plugin__forklift-console-plugin~Providers for virtualization')
      name: '%plugin__forklift-console-plugin~Providers for virtualization (old)%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,

  {
    properties: {
      component: {
        $codeRef: 'ProvidersListPageOld',
      },
      model: ProviderModelGroupVersionKind1,
    },
    type: 'console.page/resource/list',
  } as EncodedExtension<ResourceListPage>,

  {
    properties: {
      component: {
        $codeRef: 'ProvidersListPageOld',
      },
      exact: false,
      path: [
        '/k8s/all-namespaces/forklift.konveyor.io~v1beta1~Provider1',
        '/k8s/ns/konveyor-forklift/forklift.konveyor.io~v1beta1~Provider1',
      ],
    },
    type: 'console.page/route',
  },

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
      ...ProviderModel,
    },
    type: 'console.model-metadata',
  } as EncodedExtension<ModelMetadata>,

  {
    properties: {
      component: {
        $codeRef: 'ProvidersCreatePage',
      },
      model: ProviderModelGroupVersionKind,
      ...ProviderModel,
    },
    type: 'console.resource/create',
  } as EncodedExtension<CreateResource>,

  {
    properties: {
      provider: { $codeRef: 'ProvidersCreateVmMigrationContext.CreateVmMigrationProvider' },
      useValueHook: {
        $codeRef: 'ProvidersCreateVmMigrationContext.useCreateVmMigrationContextValue',
      },
    },
    type: 'console.context-provider',
  } as EncodedExtension<ContextProvider>,
];
