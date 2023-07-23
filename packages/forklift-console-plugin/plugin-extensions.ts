import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import type { NavSection } from '@openshift-console/dynamic-plugin-sdk';

import { extensions as mockConsoleExtensions } from './src/__mock-console-extension/dynamic-plugin';
import { extensions as networkMapExtensions } from './src/modules/NetworkMaps/dynamic-plugin';
import { extensions as overviewExtensions } from './src/modules/Overview/dynamic-plugin';
import { extensions as planExtensions } from './src/modules/Plans/dynamic-plugin';
import { extensions as providerExtensions } from './src/modules/Providers/dynamic-plugin';
import { extensions as storageMapExtensions } from './src/modules/StorageMaps/dynamic-plugin';

const extensions: EncodedExtension[] = [
  ...mockConsoleExtensions,

  {
    type: 'console.navigation/section',
    properties: {
      id: 'migration',
      name: '%plugin__kubevirt-plugin~Migration%',
      insertAfter: ['virtualization', 'workloads'],
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-migration',
        'data-testid': 'migration-nav-item',
      },
    },
  } as EncodedExtension<NavSection>,

  ...overviewExtensions,
  ...providerExtensions,
  ...planExtensions,
  ...networkMapExtensions,
  ...storageMapExtensions,
];

export default extensions;
