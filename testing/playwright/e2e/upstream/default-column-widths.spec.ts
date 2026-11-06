import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupForkliftIntercepts } from '../../intercepts/setupForkliftIntercepts';
import {
  columnWidthResetButton,
  resetColumnWidthsIfEnabled,
  revealColumnWidthReset,
} from '../../utils/columnWidthControls';
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
const HANDLE_CLEARANCE_PX = 2;
const SHRINK_DRAG_PX = -400;
const WIDTH_TOLERANCE_PX = 1;
const SHARE_TOLERANCE = 0.001;
const VIEWPORT_WIDTHS = [1100, 1280, 1440, 1920];
const NARROW_VIEWPORT_PX = 1280;
// The data area (not the viewport) must fit once it is at least this wide.
const FIT_CONTAINER_PX = 1440;
// Weight ordering needs slack beyond the readable minima. At 1440 the data area is only
// ~1030px and NetworkMap/StorageMap fit with ~50px left over, which the engine correctly
// gives to the heaviest column while the rest stay at their minimum (project == compact).
// Only the widest matrix point leaves enough slack to observe weighting.
const WEIGHTED_VIEWPORT_PX = 1920;

type WeightedResource = {
  compactId: string;
  kind: string;
  title: string;
};

type WeightedScenario = {
  page: Page;
  resource: WeightedResource;
  table: Locator;
  width: number;
};

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

const expectWeightedWidths = async (
  table: Locator,
  compactId: string,
  expectOrdering: boolean,
): Promise<void> => {
  // AGENTS.md (this PR): "fill the available data area when readable; allow horizontal
  // scrolling when the sum of readable minima exceeds it". So there are three valid
  // states: scrolling (readable minima), fitted with slack (weights apply), or fitted
  // exactly at the minima (no slack left to weight). Ordering only applies to the middle.
  const describe = (): Promise<string> =>
    table.evaluate(
      (element, { id, wantOrdering }) => {
        const scroller = element.parentElement;
        const overflow = scroller ? scroller.scrollWidth - scroller.clientWidth : 0;
        const headers = Array.from(
          element.querySelectorAll<HTMLTableCellElement>('thead th[data-resizable-column="true"]'),
        ).filter((header) => getComputedStyle(header).display !== 'none');
        const widths = headers.map((header) => header.getBoundingClientRect().width);
        const narrowest = Math.min(...widths);
        const name = element.querySelector('th#name')?.getBoundingClientRect().width ?? 0;
        const project = element.querySelector('th#namespace')?.getBoundingClientRect().width ?? 0;
        const compact = element.querySelector(`th#${id}`)?.getBoundingClientRect().width ?? 0;
        const ordered = name > project && project > compact && name > compact * 1.5;
        const readable = headers.length > 0 && narrowest >= 95;
        const scrolls = overflow > 1;
        const needsOrdering = wantOrdering && !scrolls;
        // Always hold the heaviest column above the lightest one, in every layout state;
        // strict per-step weight ordering is only observable where the table has slack.
        const weaklyOrdered = name >= compact;
        const ok = element.isConnected && readable && weaklyOrdered && (!needsOrdering || ordered);
        const round = (value: number): number => Math.round(value * 10) / 10;
        return ok
          ? 'balanced'
          : `mode=${scrolls ? 'scroll' : 'fit'} name=${String(round(name))} ` +
              `project=${String(round(project))} compact=${String(round(compact))} ` +
              `narrowest=${String(round(narrowest))} overflow=${String(round(overflow))} ` +
              `readable=${String(readable)} ordered=${String(ordered)} ` +
              `needsOrdering=${String(needsOrdering)}`;
      },
      { id: compactId, wantOrdering: expectOrdering },
    );

  await expect
    .poll(describe, {
      message: `${compactId}: expected readable columns, weighted when the table has slack`,
    })
    .toBe('balanced');
};

const assertWeightedWidthsAtWidth = async ({
  page,
  resource,
  table,
  width,
}: WeightedScenario): Promise<void> => {
  await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
  await resetColumnWidthsIfEnabled(page);
  await expectWeightedWidths(table, resource.compactId, width >= WEIGHTED_VIEWPORT_PX);
  await expectReadableTableLayout(
    table,
    { fitWhenContainerAtLeastPx: FIT_CONTAINER_PX },
    { kind: resource.kind, width },
  );
  await expectEveryResizeHandleAligned(table, { kind: resource.kind, width });

  const initialShare = await getNameShare(table);
  await table.locator('th#name button[data-resize-handle="true"]').press('Shift+ArrowRight');
  await revealColumnWidthReset(page);
  const reset = columnWidthResetButton(page);
  await expect(reset).toBeEnabled();
  await reset.click();
  await expectWeightedWidths(table, resource.compactId, width >= WEIGHTED_VIEWPORT_PX);
  await expectReadableTableLayout(table, {}, { kind: resource.kind, width });
  await expectEveryResizeHandleAligned(table, { kind: resource.kind, width });

  // Async controls can change the available data budget; reset must preserve the preference.
  expect(Math.abs((await getNameShare(table)) - initialShare)).toBeLessThan(SHARE_TOLERANCE);

  await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: NARROW_VIEWPORT_PX });
  await expectWeightedWidths(table, resource.compactId, false);
  await expectReadableTableLayout(table, {}, { kind: resource.kind, width: NARROW_VIEWPORT_PX });
};

const assertCompactColumnPersists = async ({
  page,
  resource,
  table,
}: Omit<WeightedScenario, 'width'>): Promise<void> => {
  await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: NARROW_VIEWPORT_PX });
  await expectWeightedWidths(table, resource.compactId, false);

  const compact = table.locator(`th#${resource.compactId}`);
  const initialWidth = await getWidth(compact);
  expect(initialWidth).toBeGreaterThanOrEqual(MIN_READABLE_WIDTH_PX - WIDTH_TOLERANCE_PX);
  const nameWidth = await getWidth(table.locator('th#name'));
  const compactHandle = compact.locator('button[data-resize-handle="true"]');
  await compact.evaluate((cell) => {
    const scroller = cell.closest('table')?.parentElement;
    if (scroller) {
      scroller.scrollLeft = 0;
    }
  });
  await compactHandle.scrollIntoViewIfNeeded();
  // Viewport visibility alone does not account for the sticky Actions header.
  await compactHandle.evaluate((handle, clearance) => {
    const tableElement = handle.closest('table');
    const scroller = tableElement?.parentElement;
    const actions = tableElement?.querySelector('thead th[data-action-column="true"]');
    if (scroller && actions) {
      const overlap = handle.getBoundingClientRect().right - actions.getBoundingClientRect().left;
      if (overlap > 0) scroller.scrollLeft += overlap + clearance;
    }
  }, HANDLE_CLEARANCE_PX);
  await compactHandle.click({ trial: true });
  const box = await compactHandle.boundingBox();
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
    const currentWidth = await getWidth(compact);
    if (delta > 0) {
      expect(
        Math.abs(currentWidth - initialWidth - delta),
        `after moving +${String(delta)}px the compact column is ${String(currentWidth)}`,
      ).toBeLessThan(WIDTH_TOLERANCE_PX);
    } else {
      // Shrinking stops at the column's readable floor: it may move less than asked, but
      // must never go below the floor or grow.
      expect(
        currentWidth,
        `after moving ${String(delta)}px the compact column is ${String(currentWidth)}`,
      ).toBeGreaterThanOrEqual(MIN_READABLE_WIDTH_PX - WIDTH_TOLERANCE_PX);
      expect(currentWidth).toBeLessThanOrEqual(initialWidth + WIDTH_TOLERANCE_PX);
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
};

test.describe('Weighted default column widths', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupForkliftIntercepts(page);
  });

  for (const resource of [
    { compactId: 'vmCount', kind: 'Provider', title: 'Providers' },
    { compactId: 'vms', kind: 'Plan', title: 'Migration plans' },
    { compactId: 'phase', kind: 'NetworkMap', title: 'Network maps' },
    { compactId: 'phase', kind: 'StorageMap', title: 'Storage maps' },
  ]) {
    test(`${resource.kind}: weighted initial/reset widths remain readable`, async ({ page }) => {
      await test.step(`open the ${resource.title} list`, async () => {
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
      });
      const table = page.getByRole('grid', { exact: true, name: resource.title });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();

      for (const width of VIEWPORT_WIDTHS) {
        await test.step(`weighted widths at ${width}px`, async () => {
          await assertWeightedWidthsAtWidth({ page, resource, table, width });
        });
      }
    });
  }

  for (const resource of [
    { compactId: 'vmCount', kind: 'Provider', title: 'Providers' },
    { compactId: 'vms', kind: 'Plan', title: 'Migration plans' },
  ]) {
    test(`${resource.kind}: a compact column respects its minimum and persists`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: NARROW_VIEWPORT_PX });
      await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
      const table = page.getByRole('grid', { exact: true, name: resource.title });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
      await assertCompactColumnPersists({ page, resource, table });
    });
  }
});
