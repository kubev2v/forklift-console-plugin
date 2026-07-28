import type { Page } from '@playwright/test';

/**
 * Mocks the Pod/Job/PVC/DataVolume list watches that
 * `useMigrationResources` (Plan > Virtual machines tab, migration-in-progress view) issues
 * per VM via `selector: { matchLabels: { plan: <planUid> } }`. Returning empty lists lets
 * those watches resolve to `loaded: true` immediately without needing real migration
 * workload resources.
 */
export const setupMigrationVmResourceIntercepts = async (page: Page): Promise<void> => {
  const emptyList = (kind: string, apiVersion: string) => ({
    apiVersion,
    kind: `${kind}List`,
    metadata: {},
    items: [],
  });

  await page.route('**/api/kubernetes/api/v1/namespaces/*/pods**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyList('Pod', 'v1')),
    });
  });

  await page.route('**/api/kubernetes/apis/batch/v1/namespaces/*/jobs**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyList('Job', 'batch/v1')),
    });
  });

  await page.route(
    '**/api/kubernetes/api/v1/namespaces/*/persistentvolumeclaims**',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyList('PersistentVolumeClaim', 'v1')),
      });
    },
  );

  await page.route(
    '**/api/kubernetes/apis/cdi.kubevirt.io/v1beta1/namespaces/*/datavolumes**',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyList('DataVolume', 'cdi.kubevirt.io/v1beta1')),
      });
    },
  );
};
