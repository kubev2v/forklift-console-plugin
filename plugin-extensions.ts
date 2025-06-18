import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk-webpack';
import type { NavSection } from '@openshift-console/dynamic-plugin-sdk';

import { extensions as networkMapExtensions } from './src/modules/NetworkMaps/dynamic-plugin';
import { extensions as planExtensions } from './src/modules/Plans/dynamic-plugin';
import { extensions as storageMapExtensions } from './src/modules/StorageMaps/dynamic-plugin';
import { extensions as overviewExtensions } from './src/overview/dynamic-plugin';
import { extensions as providerExtensions } from './src/providers/dynamic-plugin';

const extensions: EncodedExtension[] = [
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-migration',
        'data-testid': 'migration-nav-item',
      },
      id: 'migration',
      insertAfter: ['virtualization', 'workloads'],
      // t('plugin__forklift-console-plugin~Migration for Virtualization')
      name: '%plugin__forklift-console-plugin~Migration for Virtualization%',
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,

  ...overviewExtensions,
  ...providerExtensions,
  ...planExtensions,
  ...storageMapExtensions,
  ...networkMapExtensions,
];

export default extensions;
