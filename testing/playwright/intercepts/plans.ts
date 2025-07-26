import type { Page } from '@playwright/test';

import { TEST_DATA } from '../fixtures/test-data';

export const setupPlansIntercepts = async (page: Page) => {
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

  // Individual plan GET request (used by usePlan hook for plan details)
  // This is the MOST IMPORTANT mock - it provides the plan data for the details page
  // The useK8sWatchResource uses a watch request with field selector, not a direct GET
  // EXACT pattern from logs: /api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/plans?watch=true&fieldSelector=metadata.name%3Dtest-create-plan
  await page.route(
    '**/namespaces/openshift-mtv/plans?watch=true&fieldSelector=metadata.name%3Dtest-create-plan**',
    async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      // eslint-disable-next-line no-console
      console.log(`🎯 EXACT WATCH MOCK TRIGGERED - ${method} ${url}`);

      if (method === 'GET') {
        // eslint-disable-next-line no-console
        console.log(`✅ SERVING EXACT WATCH DATA FOR: ${TEST_DATA.planName}`);

        const planData = {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Plan',
          metadata: {
            name: TEST_DATA.planName,
            namespace: 'openshift-mtv',
            uid: 'test-plan-uid-1',
            creationTimestamp: new Date().toISOString(),
            resourceVersion: '123456',
          },
          spec: {
            provider: {
              source: { name: TEST_DATA.providers.source.name, namespace: 'openshift-mtv' },
              destination: { name: TEST_DATA.providers.target.name, namespace: 'openshift-mtv' },
            },
            targetNamespace: TEST_DATA.targetProject,
            type: 'Cold',
            warm: false,
            vms: [
              {
                id: 'test-vm-1',
                name: 'test-virtual-machine-1',
              },
            ],
          },
          status: {
            phase: 'Ready',
            conditions: [
              {
                type: 'Ready',
                status: 'True',
                message: 'The plan is ready for migration.',
                category: 'Info',
              },
            ],
          },
        };

        // For watch requests, return the single item directly (not wrapped in a list)
        // eslint-disable-next-line no-console
        console.log(`🎯 DIRECT PLAN DATA SERVED:`, JSON.stringify(planData.metadata, null, 2));

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(planData),
        });
      } else {
        await route.continue();
      }
    },
  );

  // BACKUP: Also try to catch any other plan watch patterns
  await page.route('**/plans?watch=true**', async (route) => {
    const url = route.request().url();
    if (url.includes('test-create-plan')) {
      // eslint-disable-next-line no-console
      console.log(`🔥 BACKUP MOCK TRIGGERED - ${route.request().method()} ${url}`);
      // Redirect to our main handler
      await route.continue();
    } else {
      await route.continue();
    }
  });

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

  // Catch ANY authorization API call
  await page.route('**/authorization.k8s.io/**', async (route) => {
    if (route.request().url().includes('selfsubjectaccessreviews')) {
      if (route.request().method() === 'POST') {
        const authResponse = {
          apiVersion: 'authorization.k8s.io/v1',
          kind: 'SelfSubjectAccessReview',
          metadata: { creationTimestamp: null },
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
      }
    } else {
      await route.continue();
    }
  });

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
      // eslint-disable-next-line no-console
      console.log(`🚀 PLAN CREATION: ${route.request().method()} ${route.request().url()}`);
      if (route.request().method() === 'POST') {
        // eslint-disable-next-line no-console
        console.log(`🎯 CREATING PLAN: ${TEST_DATA.planName}`);
        try {
          const response = {
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            metadata: {
              name: TEST_DATA.planName,
              namespace: 'openshift-mtv',
              uid: 'test-plan-uid-1',
              creationTimestamp: new Date().toISOString(),
            },
            spec: {
              provider: {
                destination: { name: TEST_DATA.providers.target.name, namespace: 'openshift-mtv' },
                source: { name: TEST_DATA.providers.source.name, namespace: 'openshift-mtv' },
              },
            },
          };
          // eslint-disable-next-line no-console
          console.log(`✅ PLAN CREATION SUCCESS: Returning plan data`);
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify(response),
          });
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(`❌ PLAN CREATION ERROR:`, error);
          await route.abort();
        }
      }
    },
  );
};
