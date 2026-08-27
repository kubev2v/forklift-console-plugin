import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

export const setupPlansIntercepts = async (page: Page) => {
  // CRITICAL: Return a mock plan instead of empty list to avoid PlansEmptyState path
  const plansResponse = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    items: [
      {
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'Plan',
        metadata: {
          creationTimestamp: '2023-01-01T00:00:00Z',
          name: 'existing-test-plan',
          namespace: MTV_NAMESPACE,
          uid: 'existing-plan-uid',
        },
        spec: {
          provider: {
            destination: { name: TEST_DATA.providers.target.name, namespace: MTV_NAMESPACE },
            source: { name: TEST_DATA.providers.source.name, namespace: MTV_NAMESPACE },
          },
        },
        status: {
          conditions: [
            {
              message: 'The plan is ready.',
              status: 'True',
              type: 'Ready',
            },
          ],
          phase: 'Ready',
        },
      },
    ],
    kind: 'PlanList',
    metadata: {},
  };

  // Plan details for usePlan hook - handle both GET and watch requests
  const planData = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: {
      creationTimestamp: new Date().toISOString(),
      name: TEST_DATA.planName,
      namespace: MTV_NAMESPACE,
      resourceVersion: '123456',
      uid: 'test-plan-uid-1',
    },
    spec: {
      description: 'Test plan for automated testing',
      map: {
        network: {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'NetworkMap',
          name: `${TEST_DATA.planName}-networkmap`,
          namespace: MTV_NAMESPACE,
          uid: 'test-networkmap-uid-1',
        },
        storage: {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'StorageMap',
          name: `${TEST_DATA.planName}-storagemap`,
          namespace: MTV_NAMESPACE,
          uid: 'test-storagemap-uid-1',
        },
      },
      migrateSharedDisks: false,
      provider: {
        destination: {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Provider',
          name: TEST_DATA.providers.target.name,
          namespace: MTV_NAMESPACE,
          uid: TEST_DATA.providers.target.uid,
        },
        source: {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Provider',
          name: TEST_DATA.providers.source.name,
          namespace: MTV_NAMESPACE,
          uid: TEST_DATA.providers.source.uid,
        },
      },
      pvcNameTemplateUseGenerateName: true,
      skipGuestConversion: false,
      targetNamespace: TEST_DATA.targetProject,
      vms: [
        {
          id: 'test-vm-1',
          name: 'test-virtual-machine-1',
        },
      ],
      warm: false,
    },
    status: {
      conditions: [
        {
          category: 'Advisory',
          lastTransitionTime: new Date().toISOString(),
          message: 'The plan is ready.',
          reason: 'Ready',
          status: 'True',
          type: 'Ready',
        },
      ],
      phase: 'Ready',
    },
  };

  // Direct GET request for individual plan
  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/plans/${TEST_DATA.planName}`,
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          body: JSON.stringify(planData),
          contentType: 'application/json',
          status: 200,
        });
      } else {
        await route.continue();
      }
    },
  );

  // Watch request for individual plan (for real-time updates)
  // Handle both HTTP and WebSocket-like patterns
  await page.route('**/namespaces/openshift-mtv/plans?watch=true**', async (route) => {
    const url = route.request().url();

    if (url.includes(TEST_DATA.planName) || url.includes('fieldSelector')) {
      await route.fulfill({
        body: JSON.stringify({
          object: planData,
          type: 'ADDED',
        }),
        contentType: 'application/json',
        status: 200,
      });
    } else {
      await route.continue();
    }
  });

  // Alternative pattern for plan queries that might include fieldSelector
  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/plans?**`,
    async (route) => {
      const url = route.request().url();

      if (url.includes(TEST_DATA.planName) && route.request().method() === 'GET') {
        await route.fulfill({
          body: JSON.stringify(planData),
          contentType: 'application/json',
          status: 200,
        });
      } else {
        await route.continue();
      }
    },
  );

  // URL patterns that work for both local (9000) and GitHub Actions (30080)
  // Namespaced plans endpoint (wildcard namespace)
  await page.route(API_ENDPOINTS.plans, async (route) => {
    await route.fulfill({
      body: JSON.stringify(plansResponse),
      contentType: 'application/json',
      status: 200,
    });
  });

  // All plans endpoint (cluster-wide)
  await page.route(API_ENDPOINTS.allPlans, async (route) => {
    await route.fulfill({
      body: JSON.stringify(plansResponse),
      contentType: 'application/json',
      status: 200,
    });
  });

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
              group: 'forklift.konveyor.io',
              resource: 'plans',
              verb: 'create',
            },
          },
          status: {
            allowed: true,
            reason: 'RBAC: allowed by test intercept',
          },
        };

        await route.fulfill({
          body: JSON.stringify(authResponse),
          contentType: 'application/json',
          status: 201,
        });
      }
    } else {
      await route.continue();
    }
  });

  // NetworkMap creation endpoint for plan wizard
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/networkmaps$/u,
    async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'NetworkMap',
            metadata: {
              name: `${TEST_DATA.planName}-networkmap`,
              namespace: MTV_NAMESPACE,
              uid: 'test-networkmap-uid-1',
            },
            spec: {
              provider: {
                destination: { name: TEST_DATA.providers.target.name, namespace: MTV_NAMESPACE },
                source: { name: TEST_DATA.providers.source.name, namespace: MTV_NAMESPACE },
              },
            },
          }),
          contentType: 'application/json',
          status: 201,
        });
      }
    },
  );

  // StorageMap creation endpoint for plan wizard
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/storagemaps$/u,
    async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'StorageMap',
            metadata: {
              name: `${TEST_DATA.planName}-storagemap`,
              namespace: MTV_NAMESPACE,
              uid: 'test-storagemap-uid-1',
            },
            spec: {
              map: [],
              provider: {
                destination: { name: TEST_DATA.providers.target.name, namespace: MTV_NAMESPACE },
                source: { name: TEST_DATA.providers.source.name, namespace: MTV_NAMESPACE },
              },
            },
          }),
          contentType: 'application/json',
          status: 201,
        });
      }
    },
  );

  // Plan creation endpoint
  await page.route(
    /\/api\/kubernetes\/apis\/forklift\.konveyor\.io\/v1beta1\/namespaces\/openshift-mtv\/plans$/u,
    async (route) => {
      if (route.request().method() === 'POST') {
        const response = {
          apiVersion: 'forklift.konveyor.io/v1beta1',
          kind: 'Plan',
          metadata: {
            creationTimestamp: new Date().toISOString(),
            name: TEST_DATA.planName,
            namespace: MTV_NAMESPACE,
            uid: 'test-plan-uid-1',
          },
          spec: {
            provider: {
              destination: { name: TEST_DATA.providers.target.name, namespace: MTV_NAMESPACE },
              source: { name: TEST_DATA.providers.source.name, namespace: MTV_NAMESPACE },
            },
          },
        };

        await route.fulfill({
          body: JSON.stringify(response),
          contentType: 'application/json',
          status: 201,
        });
      }
    },
  );
};
