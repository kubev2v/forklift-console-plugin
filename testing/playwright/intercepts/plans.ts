/* eslint-disable no-console */
import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';

export const setupPlansIntercepts = async (page: Page) => {
  console.log('🔧 Setting up plans intercepts...');

  const plansResponse = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'PlanList',
    metadata: {},
    items: [],
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
      console.log('✅ Responded to namespaced plans request');
    },
  );

  // All plans endpoint (cluster-wide)
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/plans\?limit=\d+/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED cluster-wide plans request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plansResponse),
      });
      console.log('✅ Responded to cluster-wide plans request');
    },
  );

  // Additional plan patterns
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/.*\/plans.*/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED general namespaced plans request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plansResponse),
      });
      console.log('✅ Responded to general namespaced plans request');
    },
  );

  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/plans.*/,
    async (route) => {
      const url = route.request().url();
      console.log('🎯 INTERCEPTED general plans request:', url);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(plansResponse),
      });
      console.log('✅ Responded to general plans request');
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
          kind: 'SelfSubjectAccessReview',
          apiVersion: 'authorization.k8s.io/v1',
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
            reason: 'RBAC: allowed by ClusterRoleBinding for testing',
          },
        };
        await route.fulfill({
          status: 200,
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
        console.log('🎯 INTERCEPTED NetworkMap creation request');
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
        console.log('✅ Responded to NetworkMap creation');
      }
    },
  );

  // StorageMap creation endpoint for plan wizard
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/storagemaps/,
    async (route) => {
      if (route.request().method() === 'POST') {
        console.log('🎯 INTERCEPTED StorageMap creation request');
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
        console.log('✅ Responded to StorageMap creation');
      }
    },
  );

  // Plan creation endpoint
  await page.route(
    /.*\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/plans/,
    async (route) => {
      if (route.request().method() === 'POST') {
        console.log('🎯 INTERCEPTED Plan creation request');
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
        console.log('✅ Responded to Plan creation');
      }
    },
  );

  console.log('✨ Plans intercepts setup complete');
};
