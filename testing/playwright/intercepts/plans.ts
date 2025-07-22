import type { Page } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../fixtures/test-data';

export const setupPlansIntercepts = async (page: Page) => {
  await page.route(API_ENDPOINTS.plans, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'PlanList',
        metadata: {},
        items: [],
      }),
    });
  });

  await page.route(API_ENDPOINTS.allPlans, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'forklift.konveyor.io/v1beta1',
        kind: 'PlanList',
        metadata: {},
        items: [],
      }),
    });
  });

  await page.route(
    '**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/networkmaps',
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
                destination: { name: TEST_DATA.targetProvider, namespace: 'openshift-mtv' },
                source: { name: TEST_DATA.sourceProvider, namespace: 'openshift-mtv' },
              },
            },
          }),
        });
      }
    },
  );

  await page.route(
    '**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/storagemaps',
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
                destination: { name: TEST_DATA.targetProvider, namespace: 'openshift-mtv' },
                source: { name: TEST_DATA.sourceProvider, namespace: 'openshift-mtv' },
              },
            },
          }),
        });
      }
    },
  );

  // Mock plan creation POST request (essential for plan creation to work)
  await page.route(
    '**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/plans',
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
                destination: {
                  name: TEST_DATA.targetProvider,
                  namespace: 'openshift-mtv',
                },
                source: {
                  name: TEST_DATA.sourceProvider,
                  namespace: 'openshift-mtv',
                },
              },
              targetNamespace: TEST_DATA.targetProject,
            },
          }),
        });
      }
    },
  );

  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/networkmaps/${TEST_DATA.planName}-networkmap`,
    async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'NetworkMap',
            metadata: {
              name: `${TEST_DATA.planName}-networkmap`,
              namespace: 'openshift-mtv',
              uid: 'test-networkmap-uid-1',
            },
          }),
        });
      }
    },
  );

  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/storagemaps/${TEST_DATA.planName}-storagemap`,
    async (route) => {
      if (route.request().method() === 'PATCH') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'StorageMap',
            metadata: {
              name: `${TEST_DATA.planName}-storagemap`,
              namespace: 'openshift-mtv',
              uid: 'test-storagemap-uid-1',
            },
          }),
        });
      }
    },
  );

  // Mock plan details GET request for the created plan
  await page.route(
    `**/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/plans/${TEST_DATA.planName}`,
    async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            kind: 'Plan',
            metadata: {
              name: TEST_DATA.planName,
              namespace: 'openshift-mtv',
              uid: 'test-plan-uid-1',
              creationTimestamp: '2025-01-01T16:54:00Z',
            },
            spec: {
              provider: {
                destination: {
                  name: TEST_DATA.targetProvider,
                  namespace: 'openshift-mtv',
                },
                source: {
                  name: TEST_DATA.sourceProvider,
                  namespace: 'openshift-mtv',
                },
              },
              targetNamespace: TEST_DATA.targetProject,
            },
            status: {
              conditions: [
                {
                  category: 'Advisory',
                  lastTransitionTime: '2025-01-01T16:54:00Z',
                  message: 'The plan is ready.',
                  reason: 'Ready',
                  status: 'True',
                  type: 'Ready',
                },
              ],
            },
          }),
        });
      }
    },
  );

  await page.route('**/apis/authorization.k8s.io/v1/subjectaccessreviews', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SubjectAccessReview',
        status: {
          allowed: true,
        },
      }),
    });
  });
};
