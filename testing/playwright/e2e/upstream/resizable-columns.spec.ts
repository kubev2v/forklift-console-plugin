import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { V5_0_0 } from '../../utils/version/constants';
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

test.describe('Resizable list columns', { tag: '@upstream' }, () => {
  requireVersion(test, V5_0_0);

  test.beforeEach(async ({ page }) => {
    await setupPlansIntercepts(page);
    await setupProvidersIntercepts(page);
  });

  for (const resource of [
    { kind: 'Provider', title: 'Providers' },
    { kind: 'Plan', title: 'Migration plans' },
  ]) {
    for (const width of [1280, 1440, 1920]) {
      test(`${resource.kind}: reset exposes the last resize handle at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
        const table = page.getByRole('grid', { exact: true, name: resource.title });
        await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
        const name = table.locator('th#name');
        const { x, y } = await startResize(page, name);
        await page.mouse.move(x + SMALL_DRAG_PX * 10, y);
        await page.mouse.up();
        await page.getByRole('button', { exact: true, name: 'Reset column widths' }).click();

        const handle = table.locator('thead th').nth(-2).locator('button[aria-label]');
        await expect(handle).toBeVisible();
        await expect
          .poll(() =>
            handle.evaluate((button) => {
              const rect = button.getBoundingClientRect();
              const actions = button.closest('th')?.nextElementSibling?.getBoundingClientRect();
              const target = document.elementFromPoint(
                rect.x + rect.width / 2,
                rect.y + rect.height / 2,
              );
              return button.contains(target) && Boolean(actions && rect.right <= actions.left);
            }),
          )
          .toBe(true);
      });
    }
  }

  test('plans: growing Name after shrinking adjacent columns does not jump', async ({ page }) => {
    await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: 1920 });
    await page.goto('/k8s/all-namespaces/forklift.konveyor.io~v1beta1~Plan');
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
    await page.getByRole('button', { exact: true, name: 'Reset column widths' }).click();
    const name = table.locator('th#name');
    const project = table.locator('th#namespace');
    await shrinkColumn(page, name);
    await shrinkColumn(page, project);
    await expectSmoothGrowth(page, name, project);

    await page.reload();
    await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
    await expectSmoothGrowth(page, name, project);
  });
});
