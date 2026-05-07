import { expect, test } from '@playwright/test';

import { setupForkliftIntercepts, setupLightspeedIntercepts } from '../../intercepts';
import { OverviewPage } from '../../page-objects/OverviewPage';
import { V2_12_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

test.describe(
  'Lightspeed MCP Warning Banner',
  {
    tag: '@upstream',
  },
  () => {
    requireVersion(test, V2_12_0);
    test('should show warning when Lightspeed is installed but MCP service is missing', async ({
      page,
    }) => {
      await setupForkliftIntercepts(page);
      await setupLightspeedIntercepts(page, {
        hasLightspeedSubscription: true,
        hasMcpService: false,
      });

      const overviewPage = new OverviewPage(page);

      await test.step('Navigate to MTV Overview page', async () => {
        await overviewPage.navigateDirectly();
      });

      await test.step('Verify warning banner is visible with correct text', async () => {
        await expect(overviewPage.mcpWarningBanner).toBeVisible();
        await expect(overviewPage.mcpWarningBanner).toContainText(
          'Reinstall or update the MTV operator',
        );
      });

      await test.step('Verify "Go to Installed Operators" link is present', async () => {
        await expect(overviewPage.mcpWarningLink).toBeVisible();
        await expect(overviewPage.mcpWarningLink).toHaveAttribute(
          'href',
          '/k8s/ns/openshift-mtv/operators.coreos.com~v1alpha1~ClusterServiceVersion',
        );
      });
    });

    test('should not show warning when both Lightspeed and MCP service exist', async ({ page }) => {
      await setupForkliftIntercepts(page);
      await setupLightspeedIntercepts(page, {
        hasLightspeedSubscription: true,
        hasMcpService: true,
      });

      const overviewPage = new OverviewPage(page);

      await test.step('Navigate to MTV Overview page', async () => {
        await overviewPage.navigateDirectly();
      });

      await test.step('Verify warning banner is not visible', async () => {
        await expect(overviewPage.mcpWarningBanner).not.toBeVisible();
      });
    });

    test('should not show warning when Lightspeed is not installed', async ({ page }) => {
      await setupForkliftIntercepts(page);
      await setupLightspeedIntercepts(page);

      const overviewPage = new OverviewPage(page);

      await test.step('Navigate to MTV Overview page', async () => {
        await overviewPage.navigateDirectly();
      });

      await test.step('Verify warning banner is not visible', async () => {
        await expect(overviewPage.mcpWarningBanner).not.toBeVisible();
      });
    });
  },
);
