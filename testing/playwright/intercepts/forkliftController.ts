import type { Page } from '@playwright/test';

const FORKLIFT_CONTROLLER_RESPONSE = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  items: [
    {
      apiVersion: 'forklift.konveyor.io/v1beta1',
      kind: 'ForkliftController',
      metadata: {
        name: 'forklift-controller',
        namespace: 'konveyor-forklift',
        resourceVersion: '999',
        uid: 'fc-uid-1',
      },
      // eslint-disable-next-line camelcase
      spec: { feature_copy_offload: true },
    },
  ],
  kind: 'ForkliftControllerList',
  metadata: { continue: '', remainingItemCount: 0, resourceVersion: '1000' },
};

/**
 * Intercepts ForkliftController list watches used by useFeatureFlags.
 * getDefaultNamespace() returns konveyor-forklift on OKD (CI) and openshift-mtv
 * downstream, so the route uses a wildcard namespace.
 */
export const setupForkliftControllerIntercept = async (page: Page): Promise<void> => {
  await page.route(
    '**/apis/forklift.konveyor.io/v1beta1/namespaces/*/forkliftcontrollers*',
    async (route) => {
      await route.fulfill({
        body: JSON.stringify(FORKLIFT_CONTROLLER_RESPONSE),
        contentType: 'application/json',
        status: 200,
      });
    },
  );
};
