import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupForkliftIntercepts } from '../../intercepts/setupForkliftIntercepts';
import { resetColumnWidthsIfEnabled } from '../../utils/columnWidthControls';
import { expectReadableTableLayout } from '../../utils/resizableColumns';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const VIEWPORT_HEIGHT = 1080;
const GROWTH_PX = 200;
const TOLERANCE_PX = 1;
const VIEWPORT_WIDTHS = [1280, 1440, 1920];

type Resource = { kind: string; title: string };

type WidthScenario = {
  page: Page;
  resource: Resource;
  table: Locator;
  width: number;
};

const getColumnWidths = (table: Locator): Promise<Record<string, number>> =>
  table.evaluate((element) =>
    Object.fromEntries(
      Array.from(
        element.querySelectorAll<HTMLTableCellElement>('thead th[data-resizable-column="true"]'),
      ).map((header) => [header.id, header.getBoundingClientRect().width]),
    ),
  );

const getOverflow = (table: Locator): Promise<number> =>
  table.evaluate((element) => {
    const container = element.parentElement;
    return container ? container.scrollWidth - container.clientWidth : 0;
  });

const expectWidthsAndOverflow = async (
  table: Locator,
  widths: Record<string, number>,
  overflow: number,
): Promise<void> => {
  await expect
    .poll(async () => {
      const actual = await getColumnWidths(table);
      return Object.entries(widths).every(
        ([id, width]) => Math.abs(actual[id] - width) < TOLERANCE_PX,
      );
    })
    .toBe(true);
  await expect
    .poll(async () => Math.abs((await getOverflow(table)) - overflow))
    .toBeLessThan(TOLERANCE_PX);
};

const navigateInSidebar = async (page: Page, kind: string): Promise<void> => {
  const link = page.getByRole('navigation', { name: 'Nav' }).locator(`a[href$="~${kind}"]`);
  if (!(await link.isVisible())) {
    await page.getByRole('button', { exact: true, name: 'Migration for Virtualization' }).click();
  }
  await link.click();
};

const assertNavigationPreservesLayout = async ({
  page,
  resource,
  table,
  width,
}: WidthScenario): Promise<void> => {
  await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
  await resetColumnWidthsIfEnabled(page);
  await expectReadableTableLayout(table, {}, { kind: resource.kind, width });

  const initialWidths = await getColumnWidths(table);
  const initialOverflow = await getOverflow(table);
  const handle = table.locator('th#name button[data-resize-handle="true"]');
  // A scrolled table slides the column under the sticky Actions cell, where the pointer
  // lands on the sticky cell and the drag silently does nothing.
  await table.evaluate((element) => {
    const scroller = element.parentElement;
    if (scroller) {
      scroller.scrollLeft = 0;
    }
  });
  await handle.scrollIntoViewIfNeeded();
  const box = await handle.boundingBox();
  if (!box) {
    throw new Error('The Name resize handle is not visible');
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + GROWTH_PX, y, { steps: 5 });
  await page.mouse.up();
  const resizedWidths = await getColumnWidths(table);
  const nameGrowth = resizedWidths.name - initialWidths.name;
  const overflow = await getOverflow(table);
  await expectWidthsAndOverflow(table, resizedWidths, overflow);
  expect(nameGrowth).toBeGreaterThan(0);
  // A customized layout keeps a spacer that absorbs spare space, so the first pixels of
  // growth come out of that spacer and only the remainder becomes horizontal overflow.
  // Assert the monotonic bound rather than an exact equality.
  expect(overflow).toBeGreaterThanOrEqual(initialOverflow - TOLERANCE_PX);
  expect(overflow).toBeLessThanOrEqual(initialOverflow + nameGrowth + TOLERANCE_PX);

  const originalDocument = await page.locator('html').elementHandle();
  const awayKind = resource.kind === 'Provider' ? 'Plan' : 'Provider';
  await test.step('navigate away and back', async () => {
    await navigateInSidebar(page, awayKind);
    await expect(table).toHaveCount(0);
    await navigateInSidebar(page, resource.kind);
  });
  expect(await originalDocument?.evaluate((element) => element.isConnected)).toBe(true);
  await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
  await expectWidthsAndOverflow(table, resizedWidths, overflow);

  await page.reload();
  await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
  await expectWidthsAndOverflow(table, resizedWidths, overflow);

  await resetColumnWidthsIfEnabled(page);
  await expectReadableTableLayout(table, {}, { kind: resource.kind, width });
};

test.describe('Navigation preserves the complete resized layout', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupForkliftIntercepts(page);
  });

  for (const resource of [
    { kind: 'Provider', title: 'Providers' },
    { kind: 'Plan', title: 'Migration plans' },
    { kind: 'NetworkMap', title: 'Network maps' },
    { kind: 'StorageMap', title: 'Storage maps' },
  ]) {
    test(`${resource.kind}: resizing Name preserves every other width and overflow`, async ({
      page,
    }) => {
      await test.step(`open the ${resource.title} list`, async () => {
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
      });
      const table = page.getByRole('grid', { exact: true, name: resource.title });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();

      for (const width of VIEWPORT_WIDTHS) {
        await test.step(`preserved layout at ${width}px`, async () => {
          await assertNavigationPreservesLayout({ page, resource, table, width });
        });
      }
    });
  }
});
