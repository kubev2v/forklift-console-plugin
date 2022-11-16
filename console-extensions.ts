import type { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import type { HrefNavItem, NavSection, Separator } from '@openshift-console/dynamic-plugin-sdk';

import { extensions as hostExtensions } from './src/modules/Hosts/dynamic-plugin';
import { extensions as mappingExtensions } from './src/modules/Mappings/dynamic-plugin';
import { extensions as planExtensions } from './src/modules/Plans/dynamic-plugin';
import { extensions as providerExtensions } from './src/modules/Providers/dynamic-plugin';
import { extensions as vmMigrationDetailExtensions } from './src/modules/VmMigrationDetails/dynamic-plugin';

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

  {
    type: 'console.navigation/href',
    properties: {
      id: 'providers',
      insertAfter: 'importSeparator',
      perspective: 'admin',
      section: 'virtualization',
      name: '%plugin__forklift-console-plugin~Providers for VM Import%',
      href: '/mtv/providers',
    },
  } as EncodedExtension<HrefNavItem>,

  {
    type: 'console.navigation/href',
    properties: {
      id: 'plans',
      insertAfter: 'providers',
      section: 'virtualization',
      name: '%plugin__forklift-console-plugin~Plans for VM Import%',
      href: '/mtv/plans',
    },
  } as EncodedExtension<HrefNavItem>,

  {
    type: 'console.navigation/href',
    properties: {
      id: 'mappings',
      insertAfter: 'plans',
      perspective: 'admin',
      section: 'virtualization',
      name: '%plugin__forklift-console-plugin~Mappings for VM Import%',
      href: '/mtv/mappings',
    },
  } as EncodedExtension<HrefNavItem>,

  ...providerExtensions,
  ...hostExtensions,
  ...planExtensions,
  ...mappingExtensions,
  ...vmMigrationDetailExtensions,
];

export default extensions;
