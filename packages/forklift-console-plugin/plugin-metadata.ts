import type { ConsolePluginMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack/lib/schema/plugin-package';

import { exposedModules as mockExtensionModules } from './src/__mock-console-extension/dynamic-plugin';
import { exposedModules as networkMapModules } from './src/modules/NetworkMaps/dynamic-plugin';
import { exposedModules as overviewModules } from './src/modules/Overview/dynamic-plugin';
import { exposedModules as planModules } from './src/modules/Plans/dynamic-plugin';
import { exposedModules as providerModules } from './src/modules/Providers/dynamic-plugin';
import { exposedModules as storageMapModules } from './src/modules/StorageMaps/dynamic-plugin';
import pkg from './package.json';

const pluginMetadata: ConsolePluginMetadata = {
  name: process.env.PLUGIN_NAME || 'forklift-console-plugin',
  version: process.env.VERSION || pkg?.version || '0.0.0',
  displayName: 'OpenShift Console Plugin For Forklift',
  description:
    'Forklift is a suite of migration tools that facilitate the migration of VM workloads to KubeVirt.',
  exposedModules: {
    ...mockExtensionModules,
    ...overviewModules,
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
