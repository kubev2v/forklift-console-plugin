import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupProjectsIntercepts = async (page: Page) => {
  const projectsResponse = {
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
  };

  const namespacesResponse = {
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
  };

  // URL patterns that work for both local (9000) and GitHub Actions (30080)
  // OpenShift projects endpoint
  await page.route(API_ENDPOINTS.projects, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(projectsResponse),
    });
  });

  // Kubernetes namespaces endpoint (for CI environment)
  await page.route(API_ENDPOINTS.namespaces, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(namespacesResponse),
    });
  });

  // Additional patterns for projects
  await page.route(
    /.*\/api\/kubernetes\/apis\/project\.openshift\.io\/v1\/projects.*/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(projectsResponse),
      });
    },
  );

  await page.route(/.*\/api\/kubernetes\/api\/v1\/namespaces.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(namespacesResponse),
    });
  });
};
