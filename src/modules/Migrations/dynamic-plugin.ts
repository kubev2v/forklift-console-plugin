import { MigrationModel, MigrationModelGroupVersionKind } from '@kubev2v/types';
import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type { ModelMetadata, ResourceNSNavItem } from '@openshift-console/dynamic-plugin-sdk';

export const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-migrations',
        'data-testid': 'migrations-nav-item',
      },
      id: 'migrations',
      insertAfter: 'forklift-utilities-separator',
      model: MigrationModelGroupVersionKind,
      // t('plugin__forklift-console-plugin~Migrations for virtualization')
      name: '%plugin__forklift-console-plugin~Migrations for virtualization%',
      perspective: 'admin',
      section: 'migration',
    },
    type: 'console.navigation/resource-ns',
  } as EncodedExtension<ResourceNSNavItem>,

  {
    properties: {
      model: MigrationModelGroupVersionKind,
      ...MigrationModel,
    },
    type: 'console.model-metadata',
  } as EncodedExtension<ModelMetadata>,
];
