/*
 * Setup the `process.env` variables to their default values as per webpack.config.js's
 * `EnvironmentPlugin` definitions
 */

import { ENVIRONMENT_DEFAULTS } from '../../environment-defaults';

const environmentDefaults = {
  ...ENVIRONMENT_DEFAULTS,
  NODE_ENV: 'test',
};

for (const [key, value] of Object.entries(environmentDefaults)) {
  process.env[key] = value;
}
