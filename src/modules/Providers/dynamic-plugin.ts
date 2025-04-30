import { ProviderModel, ProviderModelGroupVersionKind } from '@kubev2v/types';
import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type {
  ContextProvider,
  CreateResource,
  ModelMetadata,
  ResourceDetailsPage,
} from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

export const exposedModules: ConsolePluginBuildMetadata['exposedModules'] = {
  ProviderDetailsPage: './providers/details/ProviderDetailsPage',
  ProvidersCreatePage: './modules/Providers/views/create/ProvidersCreatePage',
  ProvidersCreateVmMigrationContext:
    './modules/Providers/views/migrate/ProvidersCreateVmMigrationContext',
};

export const extensions: EncodedExtension[] = [
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
