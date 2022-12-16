/*
 * Setup the `process.env` variables to their default values as per webpack.config.js's
 * `EnvironmentPlugin` definitions
 */

import { EnvironmentPlugin } from 'webpack';

import config from '../../webpack.config';

const environmentPlugin = config.plugins.find(
  (plugin) => plugin.constructor.name === 'EnvironmentPlugin',
) as EnvironmentPlugin;

const environmentDefaults = {
  ...environmentPlugin.defaultValues,
  NODE_ENV: 'test',
};

for (const envKey in environmentDefaults) {
  process.env[envKey] = environmentDefaults[envKey];
}
