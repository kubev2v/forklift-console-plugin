import { HookModel, HookModelGroupVersionKind } from '@kubev2v/types';
import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type { ModelMetadata, ResourceNSNavItem } from '@openshift-console/dynamic-plugin-sdk';

export const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-hooks',
        'data-testid': 'hooks-nav-item',
      },
      id: 'hooks',
      model: HookModelGroupVersionKind,
      // t('plugin__forklift-console-plugin~Hooks for virtualization')
      name: '%plugin__forklift-console-plugin~Hooks for virtualization%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,

  {
    properties: {
      model: HookModelGroupVersionKind,
      ...HookModel,
    },
    type: 'console.model-metadata',
  } as EncodedExtension<ModelMetadata>,
];
