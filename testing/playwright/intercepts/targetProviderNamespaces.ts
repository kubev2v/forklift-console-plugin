import type { Page } from '@playwright/test';

import { API_ENDPOINTS } from '../fixtures/test-data';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

export const setupTargetProviderNamespacesIntercepts = async (
  page: Page,
  targetProviderUid: string,
) => {
  const endpoint = API_ENDPOINTS.targetNamespaces(targetProviderUid);
  const namespaceData = [
    {
      name: 'default',
      object: {
        metadata: {
          name: 'default',
          namespace: 'default',
          uid: 'default-uid',
        },
        spec: {},
        status: {
          phase: 'Active',
        },
      },
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/default`,
      uid: 'default-uid',
    },
    {
      name: 'test-target-project',
      object: {
        metadata: {
          name: 'test-target-project',
          namespace: 'test-target-project',
          uid: 'test-target-project-uid',
        },
        spec: {},
        status: {
          phase: 'Active',
        },
      },
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/test-target-project`,
      uid: 'test-target-project-uid',
    },
    {
      name: MTV_NAMESPACE,
      object: {
        metadata: {
          name: MTV_NAMESPACE,
          namespace: MTV_NAMESPACE,
          uid: 'openshift-mtv-uid',
        },
        spec: {},
        status: {
          phase: 'Active',
        },
      },
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/openshift-mtv`,
      uid: 'openshift-mtv-uid',
    },
  ];

  // Simple namespaces format (without detail parameter) for TargetProjectField
  const simpleNamespaceData = [
    {
      name: 'default',
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/default`,
      uid: 'default-uid',
    },
    {
      name: 'test-target-project',
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/test-target-project`,
      uid: 'test-target-project-uid',
    },
    {
      name: MTV_NAMESPACE,
      selfLink: `providers/openshift/${targetProviderUid}/namespaces/openshift-mtv`,
      uid: 'openshift-mtv-uid',
    },
  ];

  // Direct inventory endpoint
  await page.route(endpoint, async (route) => {
    await route.fulfill({
      body: JSON.stringify(namespaceData),
      contentType: 'application/json',
      status: 200,
    });
  });

  // Plugin proxy endpoint (CRITICAL for target project dropdown)
  await page.route(
    `**/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers/openshift/${targetProviderUid}/namespaces*`,
    async (route) => {
      const url = route.request().url();
      const hasDetailParam = url.includes('detail=');

      if (hasDetailParam) {
        await route.fulfill({
          body: JSON.stringify(namespaceData),
          contentType: 'application/json',
          status: 200,
        });
      } else {
        await route.fulfill({
          body: JSON.stringify(simpleNamespaceData),
          contentType: 'application/json',
          status: 200,
        });
      }
    },
  );

  // Direct inventory endpoint for all namespaces calls
  await page.route(
    `**/forklift-inventory/providers/openshift/${targetProviderUid}/namespaces*`,
    async (route) => {
      const url = route.request().url();
      const hasDetailParam = url.includes('detail=');

      if (hasDetailParam) {
        await route.fulfill({
          body: JSON.stringify(namespaceData),
          contentType: 'application/json',
          status: 200,
        });
      } else {
        await route.fulfill({
          body: JSON.stringify(simpleNamespaceData),
          contentType: 'application/json',
          status: 200,
        });
      }
    },
  );

  // Backup: Exact URL pattern from the logs
  await page.route(
    `**/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers/openshift/${targetProviderUid}/namespaces`,
    async (route) => {
      await route.fulfill({
        body: JSON.stringify(simpleNamespaceData),
        contentType: 'application/json',
        status: 200,
      });
    },
  );
};
