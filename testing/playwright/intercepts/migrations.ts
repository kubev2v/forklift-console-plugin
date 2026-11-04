import type { Page, Route } from '@playwright/test';

import {
  NEVER_RUN_PLAN,
  PERFORMANCE_MIGRATIONS,
  PERFORMANCE_PLAN,
  PROMETHEUS_LIVE_RATE_RESPONSE,
} from '../fixtures/migration-performance-data';

const FORKLIFT_MIGRATIONS = '**/apis/forklift.konveyor.io/v1beta1/migrations**';
const NAMESPACED_MIGRATIONS = '**/apis/forklift.konveyor.io/v1beta1/namespaces/*/migrations**';
const FORKLIFT_PLANS = '**/apis/forklift.konveyor.io/v1beta1/plans?limit=250';
const NAMESPACED_PLANS = '**/apis/forklift.konveyor.io/v1beta1/namespaces/*/plans?limit=250';
const PROMETHEUS_QUERY = '**/api/v1/query*';
const PROMETHEUS_RANGE = '**/api/v1/query_range*';

const fulfillJson = (route: Route, body: unknown, status = 200): Promise<void> =>
  route.fulfill({ body: JSON.stringify(body), contentType: 'application/json', status });

const listPayload = (kind: string, items: unknown[]) => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  items,
  kind: `${kind}List`,
  metadata: {},
});

export const setupEmptyMigrationsIntercepts = async (page: Page): Promise<void> => {
  const empty = listPayload('Migration', []);

  await page.route(FORKLIFT_MIGRATIONS, (route) => fulfillJson(route, empty));
  await page.route(NAMESPACED_MIGRATIONS, (route) => fulfillJson(route, empty));
};

type MigrationPerformanceIntercepts = {
  liveRate?: unknown;
  migrations?: unknown[];
  plans?: unknown[];
};

/**
 * Mocks the cluster-wide/namespaced Migration and Plan lists (plus their watches) and the
 * console Prometheus proxy used by `useLiveMigrationThroughput`.
 */
export const setupMigrationPerformanceIntercepts = async (
  page: Page,
  {
    liveRate = PROMETHEUS_LIVE_RATE_RESPONSE,
    migrations = PERFORMANCE_MIGRATIONS,
    plans = [PERFORMANCE_PLAN, NEVER_RUN_PLAN],
  }: MigrationPerformanceIntercepts = {},
): Promise<void> => {
  const migrationList = listPayload('Migration', migrations);
  const planList = listPayload('Plan', plans);

  await page.route(FORKLIFT_MIGRATIONS, (route) => fulfillJson(route, migrationList));
  await page.route(NAMESPACED_MIGRATIONS, (route) => fulfillJson(route, migrationList));
  await page.route(FORKLIFT_PLANS, (route) => fulfillJson(route, planList));
  await page.route(NAMESPACED_PLANS, (route) => fulfillJson(route, planList));

  await page.route('**/apis/forklift.konveyor.io/v1beta1/namespaces/*/plans/*', (route) => {
    if (route.request().method() !== 'GET') {
      return route.continue();
    }

    const plan = plans.find((item) => {
      const { metadata } = item as { metadata?: { name?: string } };
      return metadata?.name && route.request().url().includes(`/plans/${metadata.name}`);
    });

    return plan ? fulfillJson(route, plan) : route.continue();
  });

  await page.route(PROMETHEUS_QUERY, (route) => fulfillJson(route, liveRate));

  await page.route(PROMETHEUS_RANGE, (route) =>
    fulfillJson(route, { data: { result: [], resultType: 'matrix' }, status: 'success' }),
  );
};

/** Aborts the Prometheus proxy so the live-rate fallback path can be exercised. */
export const disablePrometheusIntercept = async (page: Page): Promise<void> => {
  await page.route(PROMETHEUS_QUERY, (route) => route.abort('failed'));
};
