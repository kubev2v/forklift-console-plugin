import { HostModel, HostModelGroupVersionKind } from '@kubev2v/types';
import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { ModelMetadata, ResourceNSNavItem } from '@openshift-console/dynamic-plugin-sdk';

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/resource-ns',
    properties: {
      id: 'hosts',
      perspective: 'admin',
      section: 'migration',
      // t('plugin__forklift-console-plugin~Hosts for virtualization')
      name: '%plugin__forklift-console-plugin~Hosts for virtualization%',
      model: HostModelGroupVersionKind,
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-hosts',
        'data-test-id': 'hosts-nav-item',
      },
    },
  } as EncodedExtension<ResourceNSNavItem>,

  {
    type: 'console.model-metadata',
    properties: {
      model: HostModelGroupVersionKind,
      ...HostModel,
    },
  } as EncodedExtension<ModelMetadata>,
];
