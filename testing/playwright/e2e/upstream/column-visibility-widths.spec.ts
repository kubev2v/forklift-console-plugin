import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { resetColumnWidthsIfEnabled, restoreDefaultColumns } from '../../utils/columnWidthControls';
import {
  expectEveryResizeHandleAligned,
  expectReadableTableLayout,
} from '../../utils/resizableColumns';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const VIEWPORT_HEIGHT = 1080;
const VIEWPORT_WIDTHS = [1280, 1440, 1920];

type Resource = {
  addedColumn: string;
  kind: string;
  resizedColumn: string;
  title: string;
};

type WidthScenario = {
  page: Page;
  resource: Resource;
  table: Locator;
  width: number;
};

const getRenderedWidth = (header: Locator): Promise<number> =>
  header.evaluate((element) => element.getBoundingClientRect().width);

const expectRenderedWidth = async (header: Locator, width: number): Promise<void> => {
  await expect.poll(() => getRenderedWidth(header)).toBeCloseTo(width, 1);
};

const setColumnVisibility = async (page: Page, label: string, visible: boolean): Promise<void> => {
  await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
  const modal = page.getByTestId('manage-columns-modal');
  await modal.getByRole('checkbox', { exact: true, name: label }).setChecked(visible);
  await modal.getByRole('button', { exact: true, name: 'Save' }).click();
  await expect(modal).not.toBeVisible();
};

const assertVisibilityPreservesWidths = async ({
  page,
  resource,
  table,
  width,
}: WidthScenario): Promise<void> => {
  const context = { kind: resource.kind, width };
  await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
  await resetColumnWidthsIfEnabled(page);
  await expectReadableTableLayout(table, {}, context);

  const name = table.locator('th#name');
  const status = table
    .locator('thead th[data-resizable-column="true"]')
    .filter({ hasText: resource.resizedColumn });
  await name.locator('button[data-resize-handle="true"]').press('Shift+ArrowRight');
  await status.locator('button[data-resize-handle="true"]').press('Shift+ArrowRight');
  const nameRenderedWidth = await getRenderedWidth(name);
  const statusRenderedWidth = await getRenderedWidth(status);

  await setColumnVisibility(page, resource.resizedColumn, false);
  await expect(status).toHaveCount(0);
  await expectRenderedWidth(name, nameRenderedWidth);

  await setColumnVisibility(page, resource.addedColumn, true);
  const added = table
    .locator('thead th[data-resizable-column="true"]')
    .filter({ hasText: resource.addedColumn });
  await expect(added).toBeVisible();
  await expectReadableTableLayout(table, {}, context);
  await expectEveryResizeHandleAligned(table, context);
  await expectRenderedWidth(name, nameRenderedWidth);
  await added.locator('button[data-resize-handle="true"]').press('Shift+ArrowRight');
  const addedRenderedWidth = await getRenderedWidth(added);

  await setColumnVisibility(page, resource.resizedColumn, true);
  await expectRenderedWidth(name, nameRenderedWidth);
  await expectRenderedWidth(status, statusRenderedWidth);
  await expectRenderedWidth(added, addedRenderedWidth);

  await page.reload();
  await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
  await expectRenderedWidth(name, nameRenderedWidth);
  await expectRenderedWidth(status, statusRenderedWidth);
  await expectRenderedWidth(added, addedRenderedWidth);

  // The added column and saved widths persist across reloads; start the next viewport clean.
  await restoreDefaultColumns(page);
};

test.describe('Column visibility preserves widths', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupPlansIntercepts(page);
    await setupProvidersIntercepts(page);
  });

  for (const resource of [
    { addedColumn: 'Clusters', kind: 'Provider', resizedColumn: 'Status', title: 'Providers' },
    {
      addedColumn: 'Description',
      kind: 'Plan',
      resizedColumn: 'Migration status',
      title: 'Migration plans',
    },
  ]) {
    test(`${resource.kind}: saved widths survive column visibility changes and reload`, async ({
      page,
    }) => {
      await test.step(`open the ${resource.title} list`, async () => {
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
      });
      const table = page.getByRole('grid', { exact: true, name: resource.title });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();

      for (const width of VIEWPORT_WIDTHS) {
        await test.step(`visibility round-trip at ${width}px`, async () => {
          await assertVisibilityPreservesWidths({ page, resource, table, width });
        });
      }
    });
  }
});
