import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import type { NavSection } from '@openshift-console/dynamic-plugin-sdk';

import { extensions as hookExtensions } from './src/modules/Hooks/dynamic-plugin';
import { extensions as mappingExtensions } from './src/modules/Mappings/dynamic-plugin';
import { extensions as migrationExtensions } from './src/modules/Migrations/dynamic-plugin';
import { extensions as planExtensions } from './src/modules/Plans/dynamic-plugin';
import { extensions as providerExtensions } from './src/modules/Providers/dynamic-plugin';

const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/section',
    properties: {
      id: 'migration',
      name: '%plugin__kubevirt-plugin~Migration%',
      insertAfter: 'workloads',
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-migration',
        'data-test-id': 'migration-nav-item',
      },
    },
  } as EncodedExtension<NavSection>,

  ...providerExtensions,
  ...planExtensions,
  ...mappingExtensions,

  {
    type: 'console.navigation/separator',
    properties: {
      perspective: 'admin',
      section: 'migration',
      insertAfter: 'storageMappings',
      id: 'forklift-utilities-seperator',
    },
  },

  ...migrationExtensions,
  ...hookExtensions,
];

export default extensions;
