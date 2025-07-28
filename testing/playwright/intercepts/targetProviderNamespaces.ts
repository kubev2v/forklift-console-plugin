import type { Page } from '@playwright/test';

import { API_ENDPOINTS } from '../fixtures/test-data';

export const setupTargetProviderNamespacesIntercepts = async (
  page: Page,
  targetProviderUid: string,
) => {
  const endpoint = API_ENDPOINTS.targetNamespaces(targetProviderUid);
  const namespaceData = [
    {
      uid: 'default-uid',
      name: 'default',
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/default`,
      object: {
        metadata: {
          name: 'default',
          uid: 'default-uid',
          namespace: 'default',
        },
        spec: {},
        status: {
          phase: 'Active',
        },
      },
    },
    {
      uid: 'test-target-project-uid',
      name: 'test-target-project',
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/test-target-project`,
      object: {
        metadata: {
          name: 'test-target-project',
          uid: 'test-target-project-uid',
          namespace: 'test-target-project',
        },
        spec: {},
        status: {
          phase: 'Active',
        },
      },
    },
    {
      uid: 'openshift-mtv-uid',
      name: 'openshift-mtv',
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/openshift-mtv`,
      object: {
        metadata: {
          name: 'openshift-mtv',
          uid: 'openshift-mtv-uid',
          namespace: 'openshift-mtv',
        },
        spec: {},
        status: {
          phase: 'Active',
        },
      },
    },
  ];

  // Simple namespaces format (without detail parameter) for TargetProjectField
  const simpleNamespaceData = [
    {
      uid: 'default-uid',
      name: 'default',
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/default`,
    },
    {
      uid: 'test-target-project-uid',
      name: 'test-target-project',
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/test-target-project`,
    },
    {
      uid: 'openshift-mtv-uid',
      name: 'openshift-mtv',
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/openshift-mtv`,
    },
  ];

  // Direct inventory endpoint
  await page.route(endpoint, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(namespaceData),
    });
  });

  // Plugin proxy endpoint (CRITICAL for target project dropdown)
  await page.route(
    `**/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers/openshift/${targetProviderUid}/namespaces*`,
    async (route) => {
      const url = route.request().url();
      const hasDetailParam = url.includes('detail=');
      // eslint-disable-next-line no-console
      console.log(`🎯 TARGET PROXY NAMESPACES: ${url}, hasDetail: ${hasDetailParam}`);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hasDetailParam ? namespaceData : simpleNamespaceData),
      });
    },
  );

  // Direct inventory endpoint for all namespaces calls
  await page.route(
    `**/forklift-inventory/providers/openshift/${targetProviderUid}/namespaces*`,
    async (route) => {
      const url = route.request().url();
      const hasDetailParam = url.includes('detail=');
      // eslint-disable-next-line no-console
      console.log(`🎯 TARGET DIRECT NAMESPACES: ${url}, hasDetail: ${hasDetailParam}`);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hasDetailParam ? namespaceData : simpleNamespaceData),
      });
    },
  );

  // Backup: Exact URL pattern from the logs
  await page.route(
    `**/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers/openshift/${targetProviderUid}/namespaces`,
    async (route) => {
      const url = route.request().url();
      // eslint-disable-next-line no-console
      console.log(`🎯 EXACT TARGET NAMESPACES MATCH: ${url}`);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(simpleNamespaceData),
      });
    },
  );
};
