import { MigrationModel, MigrationModelGroupVersionKind } from '@kubev2v/types';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { ModelMetadata, ResourceNSNavItem } from '@openshift-console/dynamic-plugin-sdk';

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/resource-ns',
    properties: {
      id: 'migrations',
      insertAfter: 'forklift-utilities-separator',
      perspective: 'admin',
      section: 'migration',
      // t('plugin__forklift-console-plugin~Migrations for virtualization')
      name: '%plugin__forklift-console-plugin~Migrations for virtualization%',
      model: MigrationModelGroupVersionKind,
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-migrations',
        'data-testid': 'migrations-nav-item',
      },
    },
  } as EncodedExtension<ResourceNSNavItem>,

  {
    type: 'console.model-metadata',
    properties: {
      model: MigrationModelGroupVersionKind,
      ...MigrationModel,
    },
  } as EncodedExtension<ModelMetadata>,
];
