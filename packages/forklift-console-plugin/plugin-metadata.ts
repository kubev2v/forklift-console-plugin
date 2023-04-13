import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

import { exposedModules as mockExtensionModules } from './src/mock-console-extension/dynamic-plugin';
import { exposedModules as networkMapModules } from './src/modules/NetworkMaps/dynamic-plugin';
import { exposedModules as planModules } from './src/modules/Plans/dynamic-plugin';
import { exposedModules as providerModules } from './src/modules/Providers/dynamic-plugin';
import { exposedModules as storageMapModules } from './src/modules/StorageMaps/dynamic-plugin';

const pluginMetadata: ConsolePluginMetadata = {
  name: process.env.PLUGIN_NAME || 'forklift-console-plugin',
  version: '0.0.1',
  displayName: 'OpenShift Console Plugin For Forklift',
  description:
    'Forklift is a suite of migration tools that facilitate the migration of VM workloads to KubeVirt.',
  exposedModules: {
    ...mockExtensionModules,
    ...providerModules,
    ...planModules,
    ...networkMapModules,
    ...storageMapModules,
  },
  dependencies: {
    '@console/pluginAPI': '>=4.11',
  },
};

export default pluginMetadata;
