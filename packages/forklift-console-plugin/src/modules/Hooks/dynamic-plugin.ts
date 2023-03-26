import { HookModel, HookModelGroupVersionKind } from '@kubev2v/types';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { ModelMetadata, ResourceNSNavItem } from '@openshift-console/dynamic-plugin-sdk';

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/resource-ns',
    properties: {
      id: 'hooks',
      perspective: 'admin',
      section: 'migration',
      // t('plugin__forklift-console-plugin~Hooks for virtualization')
      name: '%plugin__forklift-console-plugin~Hooks for virtualization%',
      model: HookModelGroupVersionKind,
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-hooks',
        'data-testid': 'hooks-nav-item',
      },
    },
  } as EncodedExtension<ResourceNSNavItem>,

  {
    type: 'console.model-metadata',
    properties: {
      model: HookModelGroupVersionKind,
      ...HookModel,
    },
  } as EncodedExtension<ModelMetadata>,
];
