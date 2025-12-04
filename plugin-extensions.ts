import type { NavSection } from '@openshift-console/dynamic-plugin-sdk';
import type { EncodedExtension } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { extensions as networkMapExtensions } from './src/networkMaps/dynamic-plugin';
import { extensions as overviewExtensions } from './src/overview/dynamic-plugin';
import { extensions as planExtensions } from './src/plans/dynamic-plugin';
import { extensions as providerExtensions } from './src/providers/dynamic-plugin';
import { extensions as storageMapExtensions } from './src/storageMaps/dynamic-plugin';

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
      perspective: 'admin',
    },
    type: 'console.navigation/section',
  } as EncodedExtension<NavSection>,
  {
    properties: {
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-migration-virt-perspective',
        'data-testid': 'migration-virt-perspective-nav-item',
      },
      id: 'migration-virt-perspective',
      insertAfter: 'cluster-virt-perspective',
      // t('plugin__forklift-console-plugin~Migration for Virtualization')
      name: '%plugin__forklift-console-plugin~Migration for Virtualization%',
      perspective: 'virtualization-perspective',
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
