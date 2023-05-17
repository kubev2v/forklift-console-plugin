/*
 * Setup the `process.env` variables to their default values as per webpack.config.js's
 * `EnvironmentPlugin` definitions
 */

import { ENVIRONMENT_DEFAULTS } from '../../webpack.config';

const environmentDefaults = {
  ...ENVIRONMENT_DEFAULTS,
  NODE_ENV: 'test',
};

Object.entries(environmentDefaults).forEach(([key, value]) => {
  process.env[key] = value;
});
