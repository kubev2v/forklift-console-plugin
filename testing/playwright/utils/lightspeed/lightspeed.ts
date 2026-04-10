import type { SkippableTest } from '../version/types';

import { LIGHTSPEED_ENV_VAR, LIGHTSPEED_GATE_TAG } from './constants';

const isLightspeedInstalled = (): boolean =>
  process.env[LIGHTSPEED_ENV_VAR]?.trim().toLowerCase() === 'true';

/**
 * Skip tests when the cluster does not have OpenShift Lightspeed installed.
 * Set LIGHTSPEED_INSTALLED=true in e2e.env to enable these tests.
 *
 *   requireLightspeed(test);
 */
export const requireLightspeed = (testObj: SkippableTest): void => {
  testObj.skip(
    !isLightspeedInstalled(),
    `${LIGHTSPEED_GATE_TAG} Requires LIGHTSPEED_INSTALLED=true`,
  );
};
