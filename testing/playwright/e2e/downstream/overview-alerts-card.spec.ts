import { expect, test } from '@playwright/test';

import { OverviewPage } from '../../page-objects/OverviewPage';
import { V5_0_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

test.describe(
  'Overview Page - Migration Alerts Card',
  {
    tag: '@downstream',
  },
  () => {
    requireVersion(test, V5_0_0);

    test.beforeEach(async ({ page }) => {
      const overviewPage = new OverviewPage(page);
      await overviewPage.navigateDirectly();
    });

    test('alerts card renders on overview page', async ({ page }) => {
      await test.step('verify the alerts card is visible', async () => {
        const alertsCard = page.getByTestId('migration-alerts-card');
        await expect(alertsCard).toBeVisible();
        await expect(alertsCard.getByText('Migration plan alerts')).toBeVisible();
      });

      await test.step('verify summary counts are displayed', async () => {
        const alertsCard = page.getByTestId('migration-alerts-card');
        await expect(alertsCard.getByText('Failed', { exact: true })).toBeVisible();
        await expect(alertsCard.getByText('Succeeded', { exact: true })).toBeVisible();
      });
    });

    test('shows empty state when no alerts are firing', async ({ page }) => {
      await test.step('check for empty state or alert list', async () => {
        const alertsCard = page.getByTestId('migration-alerts-card');
        const emptyText = alertsCard.getByText('No migrations have completed or failed yet.');
        const alertItem = alertsCard.locator('.migration-alerts-card__alert-item').first();

        const hasEmptyState = await emptyText.isVisible().catch(() => false);
        const hasAlerts = await alertItem.isVisible().catch(() => false);

        expect(hasEmptyState ? true : hasAlerts).toBeTruthy();
      });
    });

    test('"View alerts" link points to monitoring page', async ({ page }) => {
      await test.step('verify the monitoring link', async () => {
        const alertsCard = page.getByTestId('migration-alerts-card');
        const viewAlertsLink = alertsCard.getByText('View alerts');
        await expect(viewAlertsLink).toBeVisible();
        await expect(viewAlertsLink).toHaveAttribute('href', '/monitoring/alerts');
      });
    });

    test('alert list items show details when alerts are firing', async ({ page }) => {
      await test.step('check for alert items', async () => {
        const alertsCard = page.getByTestId('migration-alerts-card');
        const alertItem = alertsCard.locator('.migration-alerts-card__alert-item').first();
        const hasAlerts = await alertItem.isVisible().catch(() => false);

        if (!hasAlerts) {
          test.skip(true, 'No migration alerts are currently firing on this cluster');
        }

        await expect(alertItem.getByText('View details')).toBeVisible();
      });
    });
  },
);
