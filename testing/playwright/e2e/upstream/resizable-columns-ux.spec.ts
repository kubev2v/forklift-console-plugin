import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { PlansListPage } from '../../page-objects/PlansListPage';
import {
  expectEveryResizeHandleAligned,
  expectReadableTableLayout,
} from '../../utils/resizableColumns';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const DRAG_PX = 80;
const KEYBOARD_INCREMENT_PX = 5;
const NARROW_VIEWPORT_PX = 700;
const VIEWPORT_HEIGHT_PX = 1080;
const WIDTH_TOLERANCE_PX = 1;

const getWidth = (header: Locator): Promise<number> =>
  header.evaluate((element) => element.getBoundingClientRect().width);

const expectWidth = async (header: Locator, expected: number): Promise<void> => {
  await expect
    .poll(async () => Math.abs((await getWidth(header)) - expected))
    .toBeLessThan(WIDTH_TOLERANCE_PX);
};

const getHandleCenter = async (handle: Locator): Promise<{ x: number; y: number }> => {
  const box = await handle.boundingBox();
  if (!box) throw new Error('The resize handle is not visible');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
};

const startDrag = async (page: Page, handle: Locator): Promise<{ x: number; y: number }> => {
  const center = await getHandleCenter(handle);
  await page.mouse.move(center.x, center.y);
  await page.mouse.down();
  await page.mouse.move(center.x + DRAG_PX, center.y, { steps: 4 });
  return center;
};

test.describe('Resizable column UX regressions', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);
  test.use({ hasTouch: true });

  test.beforeEach(async ({ page }) => {
    await setupPlansIntercepts(page);
    await new PlansListPage(page).navigateDirectly('all-namespaces');
  });

  test('mouse click and touch tap without movement do not customize or save widths', async ({
    page,
  }) => {
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    const name = table.locator('th#name');
    const handle = name.locator('button[data-resize-handle="true"]');
    await expect(name).toBeVisible();
    const initialWidth = await getWidth(name);
    await handle.click();
    const center = await getHandleCenter(handle);
    await page.touchscreen.tap(center.x, center.y);

    await expect(table).toHaveAttribute('data-column-widths-customized', 'false');
    await expectWidth(name, initialWidth);
    await expect(
      page.getByRole('button', { exact: true, name: 'Reset column widths' }),
    ).toBeDisabled();
    await page.reload();
    await expectWidth(name, initialWidth);
  });

  test('Escape and pointer cancellation restore the original layout', async ({ page }) => {
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    const name = table.locator('th#name');
    const handle = name.locator('button[data-resize-handle="true"]');
    const initialWidth = await getWidth(name);

    await startDrag(page, handle);
    await expect.poll(() => getWidth(name)).toBeGreaterThan(initialWidth + WIDTH_TOLERANCE_PX);
    await page.keyboard.press('Escape');
    await page.mouse.up();
    await expectWidth(name, initialWidth);

    await startDrag(page, handle);
    await handle.dispatchEvent('pointercancel', { pointerId: 1, pointerType: 'mouse' });
    await page.mouse.up();
    await expectWidth(name, initialWidth);
    await expect(table).toHaveAttribute('data-column-widths-customized', 'false');
    await expect(
      page.getByRole('button', { exact: true, name: 'Reset column widths' }),
    ).toBeDisabled();
  });

  test('RTL touch drag changes its column while neighboring widths stay fixed', async ({
    page,
  }) => {
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    await table.evaluate((element): void => {
      element.setAttribute('dir', 'rtl');
    });
    await expectEveryResizeHandleAligned(table);
    const name = table.locator('th#name');
    const neighbor = table.locator('th#phase');
    const handle = name.locator('button[data-resize-handle="true"]');
    const initialNameWidth = await getWidth(name);
    const initialNeighborWidth = await getWidth(neighbor);
    const { x, y } = await getHandleCenter(handle);
    const cdp = await page.context().newCDPSession(page);

    await cdp.send('Input.dispatchTouchEvent', {
      touchPoints: [{ id: 1, x, y }],
      type: 'touchStart',
    });
    await cdp.send('Input.dispatchTouchEvent', {
      touchPoints: [{ id: 1, x: x - DRAG_PX, y }],
      type: 'touchMove',
    });
    await expectWidth(neighbor, initialNeighborWidth);
    await cdp.send('Input.dispatchTouchEvent', { touchPoints: [], type: 'touchEnd' });

    await expectWidth(name, initialNameWidth + DRAG_PX);
    await expectWidth(neighbor, initialNeighborWidth);
  });

  test('headers remain visible and every handle stays at its own edge below 48rem', async ({
    page,
  }) => {
    await page.setViewportSize({ height: VIEWPORT_HEIGHT_PX, width: NARROW_VIEWPORT_PX });
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    await expect(table.locator('thead')).toBeVisible();
    await expectReadableTableLayout(table);
    await expect
      .poll(() =>
        table.evaluate((element) => {
          const scroller = element.parentElement;
          return scroller ? scroller.scrollWidth - scroller.clientWidth : 0;
        }),
      )
      .toBeGreaterThan(0);
    await expectEveryResizeHandleAligned(table);
  });

  test('zoom keeps handles aligned and preserves neighboring widths during pointer and keyboard resize', async ({
    page,
  }) => {
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    await page.evaluate((): void => {
      document.documentElement.style.zoom = '1.5';
    });
    await expectEveryResizeHandleAligned(table);
    const name = table.locator('th#name');
    const neighbor = table.locator('th#phase');
    const handle = name.locator('button[data-resize-handle="true"]');
    const initialNameWidth = await getWidth(name);
    const initialNeighborWidth = await getWidth(neighbor);
    const { x, y } = await getHandleCenter(handle);

    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + DRAG_PX, y, { steps: 4 });
    await expectWidth(neighbor, initialNeighborWidth);
    await page.mouse.up();
    await expectWidth(name, initialNameWidth + DRAG_PX);
    await expectWidth(neighbor, initialNeighborWidth);

    await handle.press('ArrowRight');
    await expectWidth(name, initialNameWidth + DRAG_PX + KEYBOARD_INCREMENT_PX * 1.5);
    await expectWidth(neighbor, initialNeighborWidth);
  });

  test('RTL arrows resize in the reading direction and align handles to the left edge', async ({
    page,
  }) => {
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    await table.evaluate((element): void => {
      element.setAttribute('dir', 'rtl');
    });
    await expectEveryResizeHandleAligned(table);
    const name = table.locator('th#name');
    const handle = name.locator('button[data-resize-handle="true"]');
    const initialWidth = await getWidth(name);
    await handle.press('ArrowLeft');
    await expectWidth(name, initialWidth + KEYBOARD_INCREMENT_PX);
    await handle.press('ArrowRight');
    await expectWidth(name, initialWidth);
  });

  test('a clipped sortable header reveals its full title on hover and focus', async ({ page }) => {
    await page.setViewportSize({ height: VIEWPORT_HEIGHT_PX, width: NARROW_VIEWPORT_PX });
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    const header = table.locator('th#phase');
    const title = header.locator('[data-column-title]');
    await expect
      .poll(() => title.evaluate((element) => element.scrollWidth > element.clientWidth))
      .toBe(true);
    const tooltip = page.getByRole('tooltip').filter({ hasText: 'Migration status' });
    await title.hover();
    await expect(tooltip).toBeVisible();
    await header.locator('.pf-v6-c-table__sort-indicator').hover();
    await expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(tooltip).toBeHidden();
    await header.locator('.pf-v6-c-table__button').focus();
    await expect(tooltip).toBeVisible();
  });
});
