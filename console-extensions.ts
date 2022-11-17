import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import type { NavSection, Separator } from '@openshift-console/dynamic-plugin-sdk';

import { extensions as mappingExtensions } from './src/modules/Mappings/dynamic-plugin';
import { extensions as planExtensions } from './src/modules/Plans/dynamic-plugin';
import { extensions as providerExtensions } from './src/modules/Providers/dynamic-plugin';

const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/section',
    properties: {
      id: 'virtualization',
      name: '%plugin__kubevirt-plugin~Virtualization%',
      insertAfter: 'workloads',
      dataAttributes: {
        'data-quickstart-id': 'qs-nav-sec-virtualization',
        'data-test-id': 'virtualization-nav-item',
      },
    },
    flags: {
      disallowed: ['KUBEVIRT_DYNAMIC'],
    },
  } as EncodedExtension<NavSection>,

  {
    type: 'console.navigation/separator',
    properties: {
      perspective: 'admin',
      section: 'virtualization',
      id: 'importSeparator',
      insertAfter: 'migrationpolicies',
      testID: 'ImportSeparator',
    },
    flags: {
      required: ['KUBEVIRT_DYNAMIC'],
    },
  } as EncodedExtension<Separator>,

  ...providerExtensions,
  ...planExtensions,
  ...mappingExtensions,
];

export default extensions;
