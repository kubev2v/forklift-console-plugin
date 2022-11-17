import { EncodedExtension } from '@openshift/dynamic-plugin-sdk';
import { HrefNavItem, RoutePage } from '@openshift-console/dynamic-plugin-sdk';
import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

export const exposedModules: ConsolePluginMetadata['exposedModules'] = {
  MappingsPage: './modules/Mappings/MappingsWrapper',
};

export const extensions: EncodedExtension[] = [
  {
    type: 'console.navigation/href',
    properties: {
      id: 'mappings',
      insertAfter: 'plans',
      perspective: 'admin',
      section: 'virtualization',
      // t('plugin__forklift-console-plugin~Mappings for Import')
      name: '%plugin__forklift-console-plugin~Mappings for Import%',
      href: '/mtv/mappings',
    },
  } as EncodedExtension<HrefNavItem>,

  {
    type: 'console.page/route',
    properties: {
      component: {
        $codeRef: 'MappingsPage',
      },
      path: '/mtv/mappings',
      exact: true,
    },
  } as EncodedExtension<RoutePage>,
];
