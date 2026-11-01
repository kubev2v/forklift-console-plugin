import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { resetColumnWidthsIfEnabled, restoreDefaultColumns } from '../../utils/columnWidthControls';
import { expectReadableTableLayout } from '../../utils/resizableColumns';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const VIEWPORT_HEIGHT = 1080;
const SHRINK_DRAG_PX = 25;
const VIEWPORT_WIDTHS = [1280, 1440, 1920];

type Resource = { kind: string; title: string };

type WidthScenario = {
  page: Page;
  resource: Resource;
  table: Locator;
  width: number;
};

const getWidth = (header: Locator): Promise<number> =>
  header.evaluate((element) => element.getBoundingClientRect().width);

const shrinkColumn = async (page: Page, header: Locator): Promise<void> => {
  const handle = header.locator('button[data-resize-handle="true"]');
  const box = await handle.boundingBox();
  if (!box) {
    throw new Error('The column resize handle is not visible');
  }
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x - SHRINK_DRAG_PX, y);
  await page.mouse.up();
};

const hideEveryOptionalColumn = async (page: Page): Promise<void> => {
  await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
  const modal = page.getByTestId('manage-columns-modal');
  for (const checkbox of await modal.getByRole('checkbox').all()) {
    if (!(await checkbox.isDisabled()) && (await checkbox.isChecked())) {
      await checkbox.uncheck();
    }
  }
  await modal.getByRole('button', { exact: true, name: 'Save' }).click();
  await expect(modal).not.toBeVisible();
};

const assertFreedSpaceStaysFree = async ({
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
  const project = table.locator('th#namespace');
  await shrinkColumn(page, name);
  await shrinkColumn(page, project);
  const nameWidth = await getWidth(name);
  const projectWidth = await getWidth(project);
  const actionsWidth = await getWidth(table.locator('th[data-action-column="true"]'));

  await hideEveryOptionalColumn(page);
  await expect.poll(() => getWidth(name)).toBeCloseTo(nameWidth, 1);
  await expect.poll(() => getWidth(project)).toBeCloseTo(projectWidth, 1);
  await expect
    .poll(() => getWidth(table.locator('th[data-action-column="true"]')))
    .toBeCloseTo(actionsWidth, 1);
  await expect
    .poll(() => getWidth(table.locator('th[data-column-width-spacer="true"]')))
    .toBeGreaterThan(0);
  await expectReadableTableLayout(table, {}, context);

  await page.reload();
  await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
  await expect.poll(() => getWidth(name)).toBeCloseTo(nameWidth, 1);
  await expect.poll(() => getWidth(project)).toBeCloseTo(projectWidth, 1);

  // Every optional column is hidden at this point; restore the default set for the next viewport.
  await restoreDefaultColumns(page);
};

test.describe('Resized columns do not absorb freed space', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupPlansIntercepts(page);
    await setupProvidersIntercepts(page);
  });

  for (const resource of [
    { kind: 'Provider', title: 'Providers' },
    { kind: 'Plan', title: 'Migration plans' },
  ]) {
    test(`${resource.kind}: shrinking and retaining only resized identity columns preserves their rendered widths`, async ({
      page,
    }) => {
      await test.step(`open the ${resource.title} list`, async () => {
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
      });
      const table = page.getByRole('grid', { exact: true, name: resource.title });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();

      for (const width of VIEWPORT_WIDTHS) {
        await test.step(`freed space stays free at ${width}px`, async () => {
          await assertFreedSpaceStaysFree({ page, resource, table, width });
        });
      }
    });
  }
});
