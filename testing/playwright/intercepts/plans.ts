/* eslint-disable no-console */
import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';

export const setupPlansIntercepts = async (page: Page) => {
  console.log('🔧 Setting up plans intercepts...');

  // CRITICAL: Return a mock plan instead of empty list to avoid PlansEmptyState path
  const plansResponse = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'PlanList',
    metadata: {},
    items: [
      {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Plan',
        metadata: {
          name: 'existing-test-plan',
          namespace: 'openshift-mtv',
          uid: 'existing-plan-uid',
          creationTimestamp: '2023-01-01T00:00:00Z',
        },
        spec: {
          provider: {
            source: { name: TEST_DATA.providers.source.name, namespace: 'openshift-mtv' },
            destination: { name: TEST_DATA.providers.target.name, namespace: 'openshift-mtv' },
          },
        },
        status: {
          phase: 'Ready',
          conditions: [
            {
              type: 'Ready',
              status: 'True',
              message: 'The plan is ready.',
            },
          ],
        },
      },
    ],
  };

  console.log('📦 Mock plans response prepared:', JSON.stringify(plansResponse, null, 2));

  // URL patterns that work for both local (9000) and GitHub Actions (30080)
  // Namespaced plans endpoint (wildcard namespace)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/.*\/plans\?limit=\d+/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED namespaced plans request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plansResponse),
      });
      console.log('✅ Responded to namespaced plans request with 1 plan (to avoid empty state)');
    },
  );

  // All plans endpoint (cluster-wide)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/plans\?limit=\d+/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED general plans request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plansResponse),
      });
      console.log('✅ Responded to general plans request with 1 plan (to avoid empty state)');
    },
  );

  // SelfSubjectAccessReview for authorization (essential for button enabling)
  await page.route(
    /.*\/api\/kubernetes\/apis\/authorization\.k8s\.io\/v1\/selfsubjectaccessreviews/,
    async (route) => {
      if (route.request().method() === 'POST') {
        const url = route.request().url();
        console.log('🎯 INTERCEPTED SelfSubjectAccessReview request:', url);
        const authResponse = {
          apiVersion: 'authorization.k8s.io/v1',
          kind: 'SelfSubjectAccessReview',
          metadata: {
            creationTimestamp: null,
          },
          spec: {
            resourceAttributes: {
              verb: 'create',
              group: 'forklift.konveyor.io',
              resource: 'plans',
            },
          },
          status: {
            allowed: true,
            reason: 'RBAC: allowed by test intercept',
          },
        };
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(authResponse),
        });
        console.log('✅ Responded to SelfSubjectAccessReview with allowed=true');
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
              map: [],
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

  console.log('✨ Plans intercepts setup complete');
};
