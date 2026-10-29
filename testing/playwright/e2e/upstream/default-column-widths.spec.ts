import { expect, type Locator, test } from '@playwright/test';

import { setupNetworkMapsIntercepts } from '../../intercepts/networkMaps';
import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { setupStorageMapsIntercepts } from '../../intercepts/storageMaps';
import {
  expectEveryResizeHandleAligned,
  expectReadableTableLayout,
} from '../../utils/resizableColumns';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const VIEWPORT_HEIGHT = 1080;
const SMALL_DRAG_PX = 5;
const LARGE_DRAG_PX = 50;
const MIN_READABLE_WIDTH_PX = 96;
const SHRINK_DRAG_PX = -400;
const WIDTH_TOLERANCE_PX = 1;
const SHARE_TOLERANCE = 0.001;

const getWidth = (column: Locator): Promise<number> =>
  column.evaluate((element) => element.getBoundingClientRect().width);

const getNameShare = (table: Locator): Promise<number> =>
  table.evaluate((element) => {
    const total = Array.from(element.querySelectorAll('th[data-resizable-column="true"]')).reduce(
      (sum, header) => sum + header.getBoundingClientRect().width,
      0,
    );
    return (element.querySelector('th#name')?.getBoundingClientRect().width ?? 0) / total;
  });

const expectWeightedWidths = async (table: Locator, compactId: string): Promise<void> => {
  await expect
    .poll(() =>
      table.evaluate((element, id) => {
        const name = element.querySelector('th#name')?.getBoundingClientRect().width ?? 0;
        const project = element.querySelector('th#namespace')?.getBoundingClientRect().width ?? 0;
        const compact = element.querySelector(`th#${id}`)?.getBoundingClientRect().width ?? 0;
        return element.isConnected && name > project && project > compact && name > compact * 1.5;
      }, compactId),
    )
    .toBe(true);
};

test.describe('Weighted default column widths', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupPlansIntercepts(page);
    await setupProvidersIntercepts(page);
    await setupNetworkMapsIntercepts(page);
    await setupStorageMapsIntercepts(page);
  });

  for (const resource of [
    { compactId: 'vmCount', kind: 'Provider', title: 'Providers' },
    { compactId: 'vms', kind: 'Plan', title: 'Migration plans' },
    { compactId: 'phase', kind: 'NetworkMap', title: 'Network maps' },
    { compactId: 'phase', kind: 'StorageMap', title: 'Storage maps' },
  ]) {
    for (const width of [1100, 1280, 1440, 1920]) {
      test(`${resource.kind}: weighted initial/reset widths remain readable at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
        const table = page.getByRole('grid', { exact: true, name: resource.title });
        await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
        await expectWeightedWidths(table, resource.compactId);
        await expectReadableTableLayout(table);
        await expectEveryResizeHandleAligned(table);
        const initialShare = await getNameShare(table);
        await table.locator('th#name button[data-resize-handle="true"]').press('Shift+ArrowRight');
        const reset = page.getByRole('button', { exact: true, name: 'Reset column widths' });
        if (!(await reset.isVisible())) {
          await page.getByRole('button', { exact: true, name: 'Show Filters' }).click();
        }
        await reset.click();
        await expectWeightedWidths(table, resource.compactId);
        await expectReadableTableLayout(table);
        await expectEveryResizeHandleAligned(table);
        // Async controls can change the available data budget; reset must preserve the preference.
        expect(Math.abs((await getNameShare(table)) - initialShare)).toBeLessThan(SHARE_TOLERANCE);
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: 1280 });
        await expectWeightedWidths(table, resource.compactId);
        await expectReadableTableLayout(table);
      });
    }
  }

  for (const resource of [
    { compactId: 'vmCount', kind: 'Provider', title: 'Providers' },
    { compactId: 'vms', kind: 'Plan', title: 'Migration plans' },
  ]) {
    test(`${resource.kind}: a compact column respects its minimum and persists`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: 1280 });
      await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
      const table = page.getByRole('grid', { exact: true, name: resource.title });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
      await expectWeightedWidths(table, resource.compactId);
      const compact = table.locator(`th#${resource.compactId}`);
      const initialWidth = await getWidth(compact);
      expect(initialWidth).toBeGreaterThanOrEqual(MIN_READABLE_WIDTH_PX - WIDTH_TOLERANCE_PX);
      const nameWidth = await getWidth(table.locator('th#name'));
      const box = await compact.locator('button[data-resize-handle="true"]').boundingBox();
      if (!box) {
        throw new Error('The compact column resize handle is not visible');
      }
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      await page.mouse.move(x, y);
      await page.mouse.down();
      for (const delta of [
        -SMALL_DRAG_PX,
        SMALL_DRAG_PX,
        LARGE_DRAG_PX,
        SHRINK_DRAG_PX,
        LARGE_DRAG_PX,
      ]) {
        await page.mouse.move(x + delta, y);
        if (delta > 0) {
          expect(Math.abs((await getWidth(compact)) - initialWidth - delta)).toBeLessThan(
            WIDTH_TOLERANCE_PX,
          );
        } else {
          expect(await getWidth(compact)).toBeGreaterThanOrEqual(
            MIN_READABLE_WIDTH_PX - WIDTH_TOLERANCE_PX,
          );
        }
        expect(Math.abs((await getWidth(table.locator('th#name'))) - nameWidth)).toBeLessThan(
          WIDTH_TOLERANCE_PX,
        );
      }
      await page.mouse.up();
      const savedWidth = await getWidth(compact);
      await page.reload();
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
      expect(Math.abs((await getWidth(compact)) - savedWidth)).toBeLessThan(WIDTH_TOLERANCE_PX);
    });
  }
});
