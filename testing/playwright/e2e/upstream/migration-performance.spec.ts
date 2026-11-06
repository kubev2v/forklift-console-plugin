import { expect, test } from '@playwright/test';

import {
  MIGRATION_CANCELED_UID,
  MIGRATION_EMPTY_UID,
  MIGRATION_LIVE_UID,
  MIGRATION_PARTIAL_UID,
  MIGRATION_RUNNING_UID,
  MIGRATION_SUCCEEDED_UID,
  NEVER_RUN_PLAN_NAME,
  PERFORMANCE_NOW,
  PERFORMANCE_PLAN_NAME,
  PROMETHEUS_ZERO_RATE_RESPONSE,
} from '../../fixtures/migration-performance-data';
import {
  disablePrometheusIntercept,
  setupMigrationPerformanceIntercepts,
} from '../../intercepts/migrations';
import { setupForkliftIntercepts } from '../../intercepts/setupForkliftIntercepts';
import { HistoryTab } from '../../page-objects/OverviewPage/tabs/HistoryTab';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { PlansListPage } from '../../page-objects/PlansListPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';

test.describe('Migration performance', { tag: '@upstream' }, () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.setFixedTime(PERFORMANCE_NOW);
    await setupForkliftIntercepts(page);
    await setupMigrationPerformanceIntercepts(page);
  });

  test('History summary aggregates finished runs', async ({ page }) => {
    const historyTab = new HistoryTab(page);
    await historyTab.navigate();

    await expect(historyTab.runsCard).toContainText('6');
    await expect(historyTab.dataCard).toContainText('190 GiB');
    await expect(historyTab.medianCard).toContainText('40m');
    await expect(historyTab.averageRateCard).toContainText('19 MiB/s');
  });

  test('History rows show duration, data and rate', async ({ page }) => {
    const historyTab = new HistoryTab(page);
    await historyTab.navigate();

    await expect(historyTab.cell(MIGRATION_SUCCEEDED_UID, 'duration')).toContainText('1h 40m');
    await expect(historyTab.cell(MIGRATION_SUCCEEDED_UID, 'duration')).toContainText(
      'Copy time: 1h 30m',
    );
    await expect(historyTab.cell(MIGRATION_SUCCEEDED_UID, 'data')).toContainText('100 GiB');
    await expect(historyTab.cell(MIGRATION_SUCCEEDED_UID, 'rate')).toHaveText('19 MiB/s');

    await expect(historyTab.cell(MIGRATION_LIVE_UID, 'data')).toHaveText('—');
    await expect(historyTab.cell(MIGRATION_LIVE_UID, 'rate')).toHaveText('—');
  });

  test('History rows label partial and canceled runs', async ({ page }) => {
    const historyTab = new HistoryTab(page);
    await historyTab.navigate();

    await expect(historyTab.cell(MIGRATION_PARTIAL_UID, 'status')).toContainText(
      'Partially migrated',
    );
    await expect(historyTab.cell(MIGRATION_CANCELED_UID, 'status')).toContainText('Canceled');
  });

  test('Running rows use the live throughput rate', async ({ page }) => {
    const historyTab = new HistoryTab(page);
    await historyTab.navigate();

    await expect(historyTab.cell(MIGRATION_RUNNING_UID, 'rate')).toHaveText('50 MiB/s');
    await expect(historyTab.cell(MIGRATION_RUNNING_UID, 'duration')).toContainText('30m');
    await expect(historyTab.cell(MIGRATION_RUNNING_UID, 'data')).toContainText('50.0 GiB');
  });

  test('A zero live rate renders as 0 B/s', async ({ page }) => {
    await setupMigrationPerformanceIntercepts(page, {
      liveRate: PROMETHEUS_ZERO_RATE_RESPONSE,
    });

    const historyTab = new HistoryTab(page);
    await historyTab.navigate();

    await expect(historyTab.cell(MIGRATION_RUNNING_UID, 'rate')).toHaveText('0 B/s');
  });

  test('Running rows fall back to the CR rate without monitoring', async ({ page }) => {
    await disablePrometheusIntercept(page);

    const historyTab = new HistoryTab(page);
    await historyTab.navigate();

    await expect(historyTab.row(MIGRATION_RUNNING_UID)).toBeVisible();
    await expect(historyTab.cell(MIGRATION_RUNNING_UID, 'rate')).toHaveText('30 MiB/s');
  });

  test('Canceled runs report the cancellation time and stop growing', async ({ page }) => {
    const historyTab = new HistoryTab(page);
    await historyTab.navigate();

    await expect(historyTab.cell(MIGRATION_CANCELED_UID, 'duration')).toHaveText('20m');
    await expect(historyTab.cell(MIGRATION_CANCELED_UID, 'rate')).toHaveText('—');

    await page.clock.setFixedTime(new Date(PERFORMANCE_NOW.getTime() + 60 * 60_000));
    await page.reload();
    await expect(historyTab.table).toBeVisible();
    await expect(historyTab.cell(MIGRATION_CANCELED_UID, 'duration')).toHaveText('20m');
  });

  test('The Partial filter isolates partially migrated runs', async ({ page }) => {
    const historyTab = new HistoryTab(page);
    await historyTab.navigate();

    await historyTab.filterByStatus('Partial');

    await expect(historyTab.row(MIGRATION_PARTIAL_UID)).toBeVisible();
    await expect(historyTab.row(MIGRATION_SUCCEEDED_UID)).toHaveCount(0);
  });

  test('Plan details history shows the columns and expands per VM', async ({ page }) => {
    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.navigate(PERFORMANCE_PLAN_NAME, MTV_NAMESPACE);

    const historySection = planDetailsPage.detailsTab.migrationHistorySection;
    await historySection.expandSection();
    await expect(historySection.table).toBeVisible();
    await expect(historySection.cell(MIGRATION_SUCCEEDED_UID, 5)).toHaveText('1h 40m');
    await expect(historySection.cell(MIGRATION_SUCCEEDED_UID, 6)).toHaveText('100 GiB');
    await expect(historySection.cell(MIGRATION_SUCCEEDED_UID, 7)).toHaveText('19 MiB/s');

    await historySection.expand(MIGRATION_SUCCEEDED_UID);
    await expect(historySection.vmBreakdown).toContainText('perf-vm-a');
    await expect(historySection.vmBreakdown).toContainText('perf-vm-b');
  });

  test('A run without VM status renders the empty breakdown state', async ({ page }) => {
    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.navigate(PERFORMANCE_PLAN_NAME, MTV_NAMESPACE);

    const historySection = planDetailsPage.detailsTab.migrationHistorySection;
    await historySection.expandSection();
    await historySection.row(MIGRATION_EMPTY_UID).getByRole('button').first().click();

    await expect(page.getByText('No per-VM data for this run.')).toBeVisible();
  });

  test('The plan status popover shows the performance details', async ({ page }) => {
    const plansListPage = new PlansListPage(page);
    await plansListPage.navigateDirectly();
    await plansListPage.expectPlanVisible(PERFORMANCE_PLAN_NAME);

    const performancePlanRow = page.locator('tr').filter({
      has: page.getByTestId(`plan-link-${PERFORMANCE_PLAN_NAME}`),
    });
    const trigger = performancePlanRow.getByTestId('plan-status-popover-trigger');
    await expect(trigger).toBeVisible();
    await trigger.hover();

    const popover = page.locator('.pf-v6-c-popover');
    await expect(popover).toBeVisible();
    await expect(popover).toContainText('Total duration:');
    await expect(popover).toContainText('1h 40m');
    await expect(popover).toContainText('Copy time:');
    await expect(popover).toContainText('Data transferred:');
    await expect(popover).toContainText('100 GiB');
    await expect(popover).toContainText('Average rate:');
    await expect(popover).toContainText('19 MiB/s');
    await expect(popover).toContainText('Overall rate:');
    await expect(popover).toContainText('17 MiB/s');
    await expect(popover).toContainText('VMs succeeded:');
    await expect(popover).toContainText('2 of 2');
  });

  test('A never-run plan has no status popover', async ({ page }) => {
    const planDetailsPage = new PlanDetailsPage(page);
    await planDetailsPage.navigate(NEVER_RUN_PLAN_NAME, MTV_NAMESPACE);

    await expect(page.getByTestId('plan-status-popover-trigger')).toHaveCount(0);
  });
});
