/*
 * Setup the `process.env` variables to their default values as per webpack.config.js's
 * `EnvironmentPlugin` definitions
 */

const environmentDefaults = {
  NODE_ENV: 'test',
  DATA_SOURCE: 'remote',
  BRAND_TYPE: 'Konveyor',
  NAMESPACE: 'konveyor-forklift',
  DEFAULT_NAMESPACE: 'default',
  PLUGIN_NAME: 'forklift-console-plugin',
};

for (const envKey in environmentDefaults) {
  process.env[envKey] = environmentDefaults[envKey];
}
