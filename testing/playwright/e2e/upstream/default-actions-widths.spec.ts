import { expect, type Locator, test } from '@playwright/test';

import { API_ENDPOINTS, TEST_DATA } from '../../fixtures/test-data';
import { setupForkliftIntercepts } from '../../intercepts/setupForkliftIntercepts';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import { PlansListPage } from '../../page-objects/PlansListPage';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const VIEWPORT_HEIGHT = 1080;
const WIDE_VIEWPORT_WIDTH = 1920;
const NARROW_VIEWPORT_WIDTH = 1100;
const SETTLE_FRAMES = 10;
const STABILITY_FRAMES = 120;
const WIDTH_TOLERANCE_PX = 2;

const getScrollOverflow = (table: Locator): Promise<number> =>
  table.evaluate((element) => {
    const scroller = element.parentElement;
    return scroller ? scroller.scrollWidth - scroller.clientWidth : Number.POSITIVE_INFINITY;
  });

const expectNoUnnecessaryOverflow = async (table: Locator): Promise<void> => {
  await expect.poll(() => getScrollOverflow(table)).toBeLessThan(WIDTH_TOLERANCE_PX);
};

test.describe('default Actions widths', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupForkliftIntercepts(page);
    await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: WIDE_VIEWPORT_WIDTH });
  });

  test('empty Plans headers stop moving', async ({ page }) => {
    await test.step('open a Plans list with no rows', async () => {
      await page.route(API_ENDPOINTS.plans, async (route) => {
        await route.fulfill({
          body: JSON.stringify({
            apiVersion: 'forklift.konveyor.io/v1beta1',
            items: [],
            kind: 'PlanList',
            metadata: {},
          }),
          contentType: 'application/json',
          status: 200,
        });
      });
      await new PlansListPage(page).navigateDirectly();
    });

    await test.step('verify every data header stays still across observer frames', async () => {
      const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
      await expect(table.locator('tbody')).toContainText('No plans found');
      await expect(table.locator('tbody td[data-column-id="actions"]')).toHaveCount(0);
      await expect(table.locator('thead th[data-resizable-column="true"]')).toHaveCount(8);
      await page.evaluate(() => document.fonts.ready);
      const drift = await table.evaluate(
        async (element, { frames, settleFrames }) => {
          const headers = Array.from(
            element.querySelectorAll<HTMLTableCellElement>(
              'thead th[data-resizable-column="true"]',
            ),
          );
          for (let frame = 0; frame < settleFrames; frame += 1) {
            await new Promise<void>((resolve) => {
              requestAnimationFrame(() => {
                resolve();
              });
            });
          }
          const initial = headers.map((header) => header.getBoundingClientRect().width);
          let maximumDrift = 0;
          for (let frame = 0; frame < frames; frame += 1) {
            await new Promise<void>((resolve) => {
              requestAnimationFrame(() => {
                resolve();
              });
            });
            for (const [index, header] of headers.entries()) {
              maximumDrift = Math.max(
                maximumDrift,
                Math.abs(header.getBoundingClientRect().width - initial[index]),
              );
            }
          }
          return maximumDrift;
        },
        { frames: STABILITY_FRAMES, settleFrames: SETTLE_FRAMES },
      );
      expect(drift).toBeLessThan(WIDTH_TOLERANCE_PX);
      await expectNoUnnecessaryOverflow(table);
    });
  });

  test('populated Plans fit a wide container and scroll when columns cannot fit', async ({
    page,
  }) => {
    const list = new PlansListPage(page);
    await test.step('check the untouched wide layout', async () => {
      await list.navigateDirectly();
      const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
      await expect(
        table.locator('tbody td[data-column-id="actions"] button').first(),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expectNoUnnecessaryOverflow(table);
    });

    await test.step('preserve intentional scrolling at narrow widths', async () => {
      await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: NARROW_VIEWPORT_WIDTH });
      const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
      await expect.poll(() => getScrollOverflow(table)).toBeGreaterThan(WIDTH_TOLERANCE_PX);
    });
  });

  test('plan-details virtual machines fit a wide container', async ({ page }) => {
    await test.step('open the populated virtual machines tab', async () => {
      const details = new PlanDetailsPage(page);
      await details.navigate(TEST_DATA.planName, MTV_NAMESPACE);
      await details.virtualMachinesTab.navigateToVirtualMachinesTab();
    });

    await test.step('verify its untouched layout has no stray Actions overflow', async () => {
      const table = page.getByRole('grid', { exact: true, name: 'Virtual machines' });
      await expect(
        table.locator('tbody td[data-column-id="actions"] button').first(),
      ).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await expectNoUnnecessaryOverflow(table);
    });
  });
});
