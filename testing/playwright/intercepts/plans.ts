import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';

export const setupPlansIntercepts = async (page: Page) => {
  const plansResponse = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'PlanList',
    metadata: {},
    items: [],
  };

  // URL patterns that work for both local (9000) and GitHub Actions (30080)
  // Namespaced plans endpoint (wildcard namespace)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/.*\/plans\?limit=\d+/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plansResponse),
      });
    },
  );

  // All plans endpoint (cluster-wide)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/plans\?limit=\d+/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plansResponse),
      });
    },
  );

  // Additional plan patterns
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/.*\/plans.*/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plansResponse),
      });
    },
  );

  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/plans.*/,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plansResponse),
      });
    },
  );

  // SubjectAccessReview for authorization (essential for button enabling)
  await page.route(
    /.*\/api\/kubernetes\/apis\/authorization\.k8s\.io\/v1\/subjectaccessreviews/,
    async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            apiVersion: 'authorization.k8s.io/v1',
            kind: 'SubjectAccessReview',
            status: { allowed: true },
          }),
        });
      }
    },
  );

  // NetworkMap creation endpoint for plan wizard
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/networkmaps/,
    async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'NetworkMap',
            metadata: {
              name: `${TEST_DATA.planName}-networkmap`,
              namespace: 'openshift-mtv',
              uid: 'test-networkmap-uid-1',
            },
            spec: {
              provider: {
                destination: { name: TEST_DATA.providers.target.name, namespace: 'openshift-mtv' },
                source: { name: TEST_DATA.providers.source.name, namespace: 'openshift-mtv' },
              },
            },
          }),
        });
      }
    },
  );

  // StorageMap creation endpoint for plan wizard
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/storagemaps/,
    async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'StorageMap',
            metadata: {
              name: `${TEST_DATA.planName}-storagemap`,
              namespace: 'openshift-mtv',
              uid: 'test-storagemap-uid-1',
            },
            spec: {
              provider: {
                destination: { name: TEST_DATA.providers.target.name, namespace: 'openshift-mtv' },
                source: { name: TEST_DATA.providers.source.name, namespace: 'openshift-mtv' },
              },
            },
          }),
        });
      }
    },
  );

  // Plan creation endpoint
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/plans/,
    async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            metadata: {
              name: TEST_DATA.planName,
              namespace: 'openshift-mtv',
              uid: 'test-plan-uid-1',
            },
            spec: {
              provider: {
                destination: { name: TEST_DATA.providers.target.name, namespace: 'openshift-mtv' },
                source: { name: TEST_DATA.providers.source.name, namespace: 'openshift-mtv' },
              },
            },
          }),
        });
      }
    },
  );
};
