import { expect, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { PlansListPage } from '../../page-objects/PlansListPage';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const DRAG_OUTSIDE_HANDLE_PX = 80;

test.describe('Resize handle cursor', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupPlansIntercepts(page);
    await new PlansListPage(page).navigateDirectly('all-namespaces');
  });

  test('uses Console grab and grabbing cursors through a drag', async ({ page }) => {
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    const handle = table.locator('th#name button[data-resize-handle="true"]');

    await test.step('hover shows the open-hand cursor', async () => {
      await expect(handle).toBeVisible();
      await handle.hover();
      await expect(handle).toHaveCSS('cursor', 'grab');
    });

    const box = await handle.boundingBox();
    if (!box) throw new Error('The resize handle is not visible');
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;

    await test.step('press and drag show the closed-hand cursor', async () => {
      await page.mouse.move(x, y);
      await page.mouse.down();
      await expect(handle).toHaveCSS('cursor', 'grabbing');

      await page.mouse.move(x + DRAG_OUTSIDE_HANDLE_PX, y, { steps: 4 });
      await expect(table).toHaveAttribute('data-column-resize-active', 'true');
      await expect(handle).toHaveCSS('cursor', 'grabbing');
    });

    await test.step('release restores the open-hand cursor', async () => {
      await page.mouse.up();
      await expect(handle).toHaveCSS('cursor', 'grab');
    });
  });
});
