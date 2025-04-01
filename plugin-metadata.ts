import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { exposedModules as networkMapModules } from './src/modules/NetworkMaps/dynamic-plugin';
import { exposedModules as overviewModules } from './src/modules/Overview/dynamic-plugin';
import { exposedModules as planModules } from './src/modules/Plans/dynamic-plugin';
import { exposedModules as providerModules } from './src/modules/Providers/dynamic-plugin';
import { exposedModules as storageMapModules } from './src/modules/StorageMaps/dynamic-plugin';
import pkg from './package.json';

const pluginMetadata: ConsolePluginBuildMetadata = {
  name: process.env.PLUGIN_NAME || 'forklift-console-plugin',
  version: process.env.VERSION || pkg?.version || '0.0.0',
  displayName: 'OpenShift Console Plugin For Forklift',
  description:
    'Forklift is a suite of migration tools that facilitate the migration of VM workloads to KubeVirt.',
  exposedModules: {
    ...overviewModules,
    ...providerModules,
    ...planModules,
    ...networkMapModules,
    ...storageMapModules,
  },
  dependencies: {
    '@console/pluginAPI': '*',
  },
};

export default pluginMetadata;
