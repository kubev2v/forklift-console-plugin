import type { Page } from '@playwright/test';

/**
 * Sets up core Kubernetes API intercepts required for console bootstrap
 */
export const setupCoreKubernetesIntercepts = async (page: Page): Promise<void> => {
  // OpenAPI v2 endpoint (required for console to discover API structure)
  await page.route('**/api/kubernetes/openapi/v2', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        definitions: {},
        info: { title: 'Kubernetes', version: 'v1.0.0' },
        paths: {},
        swagger: '2.0',
      }),
      contentType: 'application/json',
      status: 200,
    });
  });

  // CustomResourceDefinitions endpoint (required for console to discover CRDs)
  await page.route(
    '**/api/kubernetes/apis/apiextensions.k8s.io/v1/customresourcedefinitions**',
    async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          apiVersion: 'apiextensions.k8s.io/v1',
          items: [],
          kind: 'CustomResourceDefinitionList',
          metadata: {},
        }),
        contentType: 'application/json',
        status: 200,
      });
    },
  );

  // User info endpoint
  await page.route('**/api/kubernetes/apis/user.openshift.io/v1/users/~', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        apiVersion: 'user.openshift.io/v1',
        kind: 'User',
        metadata: {
          name: 'test-user',
          uid: 'test-user-uid',
        },
      }),
      contentType: 'application/json',
      status: 200,
    });
  });

  // Package manifest endpoint (for operators)
  await page.route('**/api/check-package-manifest/**', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ error: 'Not found' }),
      contentType: 'application/json',
      status: 404,
    });
  });

  // GraphQL endpoint (for console queries)
  await page.route('**/api/graphql', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ data: null }),
      contentType: 'application/json',
      status: 200,
    });
  });

  // WebSocket upgrade requests
  await page.route('**/api/graphql', async (route) => {
    if (route.request().headers().upgrade === 'websocket') {
      await route.abort();
    } else {
      await route.continue();
    }
  });

  // Authorization endpoints (essential for UI permissions)
  await page.route('**/apis/authorization.k8s.io/v1/subjectaccessreviews', async (route) => {
    await route.fulfill({
      body: JSON.stringify({
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SubjectAccessReview',
        status: { allowed: true },
      }),
      contentType: 'application/json',
      status: 200,
    });
  });
};
