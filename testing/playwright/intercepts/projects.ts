import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupProjectsIntercepts = async (page: Page) => {
  await page.route(API_ENDPOINTS.projects, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'ProjectList',
        apiVersion: 'project.openshift.io/v1',
        metadata: {},
        items: TEST_DATA.projects.map((project) => ({
          metadata: {
            name: project.name,
            uid: project.uid,
            labels: {
              'kubernetes.io/metadata.name': project.name,
            },
          },
          spec: {
            finalizers: ['kubernetes'],
          },
          status: {
            phase: project.phase,
          },
        })),
      }),
    });
  });

  // Also handle Kubernetes namespaces (for CI environment)
  await page.route(API_ENDPOINTS.namespaces, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        kind: 'NamespaceList',
        apiVersion: 'v1',
        metadata: {},
        items: TEST_DATA.projects.map((project) => ({
          metadata: {
            name: project.name,
            uid: project.uid,
            labels: {
              'kubernetes.io/metadata.name': project.name,
            },
          },
          spec: {
            finalizers: ['kubernetes'],
          },
          status: {
            phase: project.phase,
          },
        })),
      }),
    });
  });
};
