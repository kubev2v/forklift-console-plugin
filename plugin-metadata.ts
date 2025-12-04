import type { ConsolePluginBuildMetadata } from '@openshift-console/dynamic-plugin-sdk-webpack';

import { exposedModules as networkMapModules } from './src/networkMaps/dynamic-plugin';
import { exposedModules as overviewModules } from './src/overview/dynamic-plugin';
import { exposedModules as planModules } from './src/plans/dynamic-plugin';
import { exposedModules as providerModules } from './src/providers/dynamic-plugin';
import { exposedModules as storageMapModules } from './src/storageMaps/dynamic-plugin';
import pkg from './package.json';

const pluginMetadata: ConsolePluginBuildMetadata = {
  dependencies: {
    '@console/pluginAPI': '*',
  },
  description:
    'Forklift is a suite of migration tools that facilitate the migration of VM workloads to KubeVirt.',
  displayName: 'OpenShift Console Plugin For Forklift',
  exposedModules: {
    ...overviewModules,
    ...providerModules,
    ...planModules,
    ...networkMapModules,
    ...storageMapModules,
  },
  name: process.env.PLUGIN_NAME ?? 'forklift-console-plugin',
  version: (process.env.VERSION ?? pkg?.version) || '0.0.0',
};

export default pluginMetadata;
