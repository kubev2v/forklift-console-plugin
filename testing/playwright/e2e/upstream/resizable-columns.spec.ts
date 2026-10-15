import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { expectLastResizeHandleVisible, expectTableToFit } from '../../utils/resizableColumns';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const LAYOUT_TOLERANCE_PX = 1;
const SMALL_DRAG_PX = 5;
const SHRINK_DRAG_PX = -400;
const VIEWPORT_HEIGHT = 1080;

const startResize = async (page: Page, header: Locator): Promise<{ x: number; y: number }> => {
  const handle = header.locator('button[aria-label]');
  const box = await handle.boundingBox();
  if (!box) {
    throw new Error('The column resize handle is not visible');
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  return { x, y };
};

const shrinkColumn = async (page: Page, header: Locator): Promise<void> => {
  const { x, y } = await startResize(page, header);
  await page.mouse.move(x + SHRINK_DRAG_PX, y, { steps: 10 });
  await page.mouse.up();
  await expect(header).toHaveCSS('min-width', '100px');
};

const getWidth = (header: Locator): Promise<number> =>
  header.evaluate((cell) => cell.getBoundingClientRect().width);

const expectSmoothGrowth = async (page: Page, name: Locator, project: Locator): Promise<void> => {
  const nameWidth = await getWidth(name);
  const projectWidth = await getWidth(project);
  const { x, y } = await startResize(page, name);
  expect(Math.abs((await getWidth(name)) - nameWidth)).toBeLessThan(LAYOUT_TOLERANCE_PX);
  for (const delta of [SMALL_DRAG_PX, SMALL_DRAG_PX * 2, SMALL_DRAG_PX * 10]) {
    await page.mouse.move(x + delta, y);
    expect(Math.abs((await getWidth(name)) - nameWidth - delta)).toBeLessThan(LAYOUT_TOLERANCE_PX);
    expect(Math.abs((await getWidth(project)) - projectWidth)).toBeLessThan(LAYOUT_TOLERANCE_PX);
  }
  const widthBeforeRelease = await getWidth(name);
  await page.mouse.up();
  expect(Math.abs((await getWidth(name)) - widthBeforeRelease)).toBeLessThan(LAYOUT_TOLERANCE_PX);
};

const resetColumnWidths = async (page: Page): Promise<void> => {
  const resetButton = page.getByRole('button', { exact: true, name: 'Reset column widths' });
  if (!(await resetButton.isVisible())) {
    await page.getByRole('button', { exact: true, name: 'Show Filters' }).click();
  }
  await resetButton.click();
};

const expectResetToPreserveTable = async (page: Page, table: Locator): Promise<void> => {
  const defaultTable = await table.elementHandle();
  await resetColumnWidths(page);
  expect(await defaultTable?.evaluate((element) => element.isConnected)).toBe(true);
};

test.describe('Resizable list columns', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupPlansIntercepts(page);
    await setupProvidersIntercepts(page);
  });

  for (const resource of [
    { kind: 'Provider', title: 'Providers' },
    { kind: 'Plan', title: 'Migration plans' },
  ]) {
    for (const width of [1100, 1280, 1440, 1920]) {
      test(`${resource.kind}: initial and reset layouts fit at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
        const table = page.getByRole('grid', { exact: true, name: resource.title });
        await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
        await expectTableToFit(table);
        await expectLastResizeHandleVisible(table);
        await expectResetToPreserveTable(page, table);
        const name = table.locator('th#name');
        const project = table.locator('th#namespace');
        await expectSmoothGrowth(page, name, project);
        expect(
          await table.evaluate((element) => {
            const container = element.parentElement;
            return container ? container.scrollWidth - container.clientWidth : 0;
          }),
        ).toBeGreaterThan(0);
        await resetColumnWidths(page);
        await expectTableToFit(table);

        await expectLastResizeHandleVisible(table);
        await expectResetToPreserveTable(page, table);
      });
    }

    test(`${resource.kind}: default widths refit when the viewport changes`, async ({ page }) => {
      await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: 1920 });
      await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
      const table = page.getByRole('grid', { exact: true, name: resource.title });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
      await expectTableToFit(table);
      for (const width of [1280, 1440, 1100, 1920]) {
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
        await expectTableToFit(table);
        await expectLastResizeHandleVisible(table);
      }
    });
  }

  test('plans: growing Name after shrinking adjacent columns does not jump', async ({ page }) => {
    await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: 1920 });
    await page.goto('/k8s/all-namespaces/forklift.konveyor.io~v1beta1~Plan');
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
    await resetColumnWidths(page);
    const name = table.locator('th#name');
    const project = table.locator('th#namespace');
    await shrinkColumn(page, name);
    await shrinkColumn(page, project);
    await expectSmoothGrowth(page, name, project);

    await page.reload();
    await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
    const spacer = table.locator('th[data-column-width-spacer="true"]');
    const spareWidth = await getWidth(spacer);
    expect(spareWidth).toBeGreaterThan(SMALL_DRAG_PX * 10);
    await expectSmoothGrowth(page, name, project);
    expect(Math.abs((await getWidth(spacer)) - spareWidth + SMALL_DRAG_PX * 10)).toBeLessThan(
      LAYOUT_TOLERANCE_PX,
    );
  });
});
