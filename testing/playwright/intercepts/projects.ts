import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';

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

  // EXACT endpoints that work in Cypress (and therefore in GitHub Actions)
  // OpenShift projects endpoint
  await page.route(
    '/api/kubernetes/apis/project.openshift.io/v1/projects?limit=250',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(projectsResponse),
      });
    },
  );

  // Kubernetes namespaces endpoint (for CI environment)
  await page.route('/api/kubernetes/api/v1/namespaces?limit=250', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(namespacesResponse),
    });
  });

  // Handle other limit values
  await page.route(
    /\/api\/kubernetes\/apis\/project\.openshift\.io\/v1\/projects\?limit=\d+/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(projectsResponse),
      });
    },
  );

  await page.route(/\/api\/kubernetes\/api\/v1\/namespaces\?limit=\d+/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(namespacesResponse),
    });
  });
};
