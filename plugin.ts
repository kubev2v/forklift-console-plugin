import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

import { exposedModules as hostModules } from './src/modules/Hosts/dynamic-plugin';
import { exposedModules as mappingModules } from './src/modules/Mappings/dynamic-plugin';
import { exposedModules as planModules } from './src/modules/Plans/dynamic-plugin';
import { exposedModules as providerModules } from './src/modules/Providers/dynamic-plugin';
import { exposedModules as vmMigrationDetailsModules } from './src/modules/VmMigrationDetails/dynamic-plugin';

export default {
  name: 'forklift-console-plugin',
  version: '0.0.1',
  displayName: 'OpenShift Console Plugin For Forklift',
  description:
    'Forklift is a suite of migration tools that facilitate the migration of VM workloads to KubeVirt.',
  exposedModules: {
    ...providerModules,
    ...planModules,
    ...mappingModules,
    ...hostModules,
    ...vmMigrationDetailsModules,
  },
  dependencies: {
    '@console/pluginAPI': '*',
  },
} as ConsolePluginMetadata;
