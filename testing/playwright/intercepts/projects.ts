import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupProjectsIntercepts = async (page: Page) => {
  const projectsResponse = {
    apiVersion: 'project.openshift.io/v1',
    items: TEST_DATA.projects.map((project) => ({
      metadata: {
        labels: {
          'kubernetes.io/metadata.name': project.name,
        },
        name: project.name,
        uid: project.uid,
      },
      spec: {
        finalizers: ['kubernetes'],
      },
      status: {
        phase: project.phase,
      },
    })),
    kind: 'ProjectList',
    metadata: {},
  };

  const namespacesResponse = {
    apiVersion: 'v1',
    items: TEST_DATA.projects.map((project) => ({
      metadata: {
        labels: {
          'kubernetes.io/metadata.name': project.name,
        },
        name: project.name,
        uid: project.uid,
      },
      spec: {
        finalizers: ['kubernetes'],
      },
      status: {
        phase: project.phase,
      },
    })),
    kind: 'NamespaceList',
    metadata: {},
  };

  // URL patterns that work for both local (9000) and GitHub Actions (30080)
  // OpenShift projects endpoint
  await page.route(API_ENDPOINTS.projects, async (route) => {
    await route.fulfill({
      body: JSON.stringify(projectsResponse),
      contentType: 'application/json',
      status: 200,
    });
  });

  // Kubernetes namespaces endpoint (for CI environment)
  await page.route(API_ENDPOINTS.namespaces, async (route) => {
    await route.fulfill({
      body: JSON.stringify(namespacesResponse),
      contentType: 'application/json',
      status: 200,
    });
  });

  // Additional patterns for projects
  await page.route(
    /\/api\/kubernetes\/apis\/project\.openshift\.io\/v1\/projects[^?]*$/u,
    async (route) => {
      await route.fulfill({
        body: JSON.stringify(projectsResponse),
        contentType: 'application/json',
        status: 200,
      });
    },
  );

  await page.route(/\/api\/kubernetes\/api\/v1\/namespaces[^?]*$/u, async (route) => {
    await route.fulfill({
      body: JSON.stringify(namespacesResponse),
      contentType: 'application/json',
      status: 200,
    });
  });
};
