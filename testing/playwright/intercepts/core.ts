import type { Page } from '@playwright/test';

/**
 * Sets up core Kubernetes API intercepts required for console bootstrap
 */
export const setupCoreKubernetesIntercepts = async (page: Page): Promise<void> => {
  // OpenAPI v2 endpoint (required for console to discover API structure)
  await page.route('**/api/kubernetes/openapi/v2', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        swagger: '2.0',
        info: { title: 'Kubernetes', version: 'v1.0.0' },
        paths: {},
        definitions: {},
      }),
    });
  });

  // CustomResourceDefinitions endpoint (required for console to discover CRDs)
  await page.route(
    '**/api/kubernetes/apis/apiextensions.k8s.io/v1/customresourcedefinitions**',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          apiVersion: 'apiextensions.k8s.io/v1',
          kind: 'CustomResourceDefinitionList',
          metadata: {},
          items: [],
        }),
      });
    },
  );

  // User info endpoint
  await page.route('**/api/kubernetes/apis/user.openshift.io/v1/users/~', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'user.openshift.io/v1',
        kind: 'User',
        metadata: {
          name: 'test-user',
          uid: 'test-user-uid',
        },
      }),
    });
  });

  // Package manifest endpoint (for operators)
  await page.route('**/api/check-package-manifest/**', async (route) => {
    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Not found' }),
    });
  });

  // GraphQL endpoint (for console queries)
  await page.route('**/api/graphql', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null }),
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
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SubjectAccessReview',
        status: { allowed: true },
      }),
    });
  });
};
