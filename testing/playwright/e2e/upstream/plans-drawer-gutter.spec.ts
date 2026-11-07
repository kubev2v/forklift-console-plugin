import { expect, type Locator, test } from '@playwright/test';

import { setupForkliftIntercepts } from '../../intercepts/setupForkliftIntercepts';
import { resetColumnWidthsIfEnabled } from '../../utils/columnWidthControls';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const PLAN_LIST_PATH = '/k8s/all-namespaces/forklift.konveyor.io~v1beta1~Plan';
const FRAME_COUNT = 240;

const measureDrawerWidths = async (
  table: Locator,
): Promise<{ hiddenWidth: number; offsetWidth: number; scrollWidth: number }> =>
  table.evaluate(async (element) => {
    const drawerContent = element.closest('.pf-v6-c-drawer__content');
    if (!(drawerContent instanceof HTMLElement)) {
      throw new Error('Plans drawer content was not found');
    }

    const originalOverflow = drawerContent.style.overflowY;
    const nextFrame = async (): Promise<void> => {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
    };

    try {
      drawerContent.style.overflowY = 'hidden';
      await nextFrame();
      const hiddenWidth = drawerContent.clientWidth;
      const { offsetWidth } = drawerContent;

      drawerContent.style.overflowY = 'scroll';
      await nextFrame();
      return { hiddenWidth, offsetWidth, scrollWidth: drawerContent.clientWidth };
    } finally {
      drawerContent.style.overflowY = originalOverflow;
    }
  });

const measureDrawerWidthChanges = async (table: Locator): Promise<number> =>
  table.evaluate(async (element, frameCount) => {
    const drawerContent = element.closest('.pf-v6-c-drawer__content');
    if (!(drawerContent instanceof HTMLElement)) {
      throw new Error('Plans drawer content was not found');
    }

    let previousWidth = drawerContent.clientWidth;
    let changes = 0;
    for (let frame = 0; frame < frameCount; frame += 1) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });
      const currentWidth = drawerContent.clientWidth;
      if (currentWidth !== previousWidth) {
        changes += 1;
      }
      previousWidth = currentWidth;
    }
    return changes;
  }, FRAME_COUNT);

test.describe('Plans drawer scrollbar geometry', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);
  test.use({ viewport: { height: 868, width: 1680 } });

  test.beforeEach(async ({ page }) => {
    await setupForkliftIntercepts(page);
  });

  test('reserves table width when the drawer scrollbar appears and after route return', async ({
    page,
  }) => {
    for (const visit of ['initial', 'route return']) {
      if (visit === 'initial') {
        await page.goto(PLAN_LIST_PATH);
      } else {
        await page
          .getByRole('grid', { exact: true, name: 'Migration plans' })
          .locator('tbody')
          .getByRole('link')
          .first()
          .click();
        await page.goBack();
      }

      const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
      await resetColumnWidthsIfEnabled(page);
      await page.evaluate(() => document.fonts.ready);

      const { hiddenWidth, offsetWidth, scrollWidth } = await measureDrawerWidths(table);
      expect(offsetWidth - hiddenWidth, `${visit}: reserved gutter width`).toBeGreaterThan(0);
      expect(scrollWidth, `${visit}: width with vertical scrollbar`).toBe(hiddenWidth);
      expect(await measureDrawerWidthChanges(table), `${visit}: frame-to-frame width changes`).toBe(
        0,
      );
    }
  });
});
