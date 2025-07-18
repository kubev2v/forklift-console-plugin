import type { Page } from '@playwright/test';

import { API_ENDPOINTS } from '../fixtures/test-data';

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

  // Handle SubjectAccessReview calls
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
