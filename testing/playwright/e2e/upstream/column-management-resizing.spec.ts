import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import {
  columnWidthResetButton,
  resetColumnWidthsIfEnabled,
} from '../../utils/columnWidthControls';
import { expectReadableTableLayout } from '../../utils/resizableColumns';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const LAYOUT_TOLERANCE_PX = 1;
const VIEWPORT_HEIGHT = 1080;
const VIEWPORT_WIDTHS = [1280, 1440, 1920];

type Resource = { kind: string; title: string };

type WidthScenario = {
  page: Page;
  resource: Resource;
  table: Locator;
  width: number;
};

const getActionWidth = (table: Locator): Promise<number> =>
  table
    .locator('thead th')
    .last()
    .evaluate((header) => header.getBoundingClientRect().width);

const getWidth = (header: Locator): Promise<number> =>
  header.evaluate((element) => element.getBoundingClientRect().width);

const expectContentSizedActions = async (table: Locator, initialWidth: number): Promise<void> => {
  await expect(table.locator('thead th').last()).toHaveCSS(
    '--pf-v6-c-table__sticky-cell--MinWidth',
    '0',
  );
  expect(Math.abs((await getActionWidth(table)) - initialWidth)).toBeLessThanOrEqual(
    LAYOUT_TOLERANCE_PX,
  );
  expect(
    await table
      .locator('thead th')
      .last()
      .evaluate((header) => header.style.width),
  ).toBe('');
  await expect(table.locator('tbody tr').first().locator('td').last()).toHaveCSS(
    '--pf-v6-c-table__sticky-cell--MinWidth',
    '0',
  );
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

const assertVisibilityRemeasuresWidths = async ({
  page,
  resource,
  table,
  width,
}: WidthScenario): Promise<void> => {
  await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
  await resetColumnWidthsIfEnabled(page);
  await expectReadableTableLayout(table, {}, { kind: resource.kind, width });

  const headerCount = await table.locator('thead th').count();
  const initialActionWidth = await getActionWidth(table);
  await expectContentSizedActions(table, initialActionWidth);
  if (resource.kind === 'Plan') {
    await table.locator('tbody input[type="checkbox"]').first().check();
  }
  const initialTable = await table.elementHandle();

  await hideEveryOptionalColumn(page);
  expect(await initialTable?.evaluate((element) => element.isConnected)).toBe(false);
  await expectReadableTableLayout(table, {}, { kind: resource.kind, width });
  await expectContentSizedActions(table, initialActionWidth);
  const managedTable = await table.elementHandle();
  await expect(columnWidthResetButton(page)).toBeDisabled();
  expect(await managedTable?.evaluate((element) => element.isConnected)).toBe(true);

  const actions = table.locator('tbody tr').first().locator('td').last();
  await actions.getByRole('button').first().click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');

  await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
  const modal = page.getByTestId('manage-columns-modal');
  await modal.getByRole('button', { name: 'Restore default columns' }).click();
  await modal.getByRole('button', { name: 'Restore default columns' }).click();
  expect(await managedTable?.evaluate((element) => element.isConnected)).toBe(true);
  await modal.getByRole('button', { exact: true, name: 'Save' }).click();
  await expect(modal).not.toBeVisible();
  await expect(table.locator('thead th')).toHaveCount(headerCount);
  await expectReadableTableLayout(table, {}, { kind: resource.kind, width });
  await expectContentSizedActions(table, initialActionWidth);
  if (resource.kind === 'Plan') {
    await expect(table.locator('tbody input[type="checkbox"]').first()).toBeChecked();
  }
};

const assertCancelAndReorderKeepWidths = async ({
  page,
  resource,
  table,
  width,
}: WidthScenario): Promise<void> => {
  await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
  await resetColumnWidthsIfEnabled(page);
  await expectReadableTableLayout(table, {}, { kind: resource.kind, width });

  const name = table.locator('th#name');
  await name.locator('button[data-resize-handle="true"]').press('Shift+ArrowRight');
  const resizedWidth = await getWidth(name);
  const resizedTable = await table.elementHandle();

  await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
  const modal = page.getByTestId('manage-columns-modal');
  await modal.getByRole('button', { name: 'Restore default columns' }).click();
  await modal.getByRole('button', { exact: true, name: 'Cancel' }).click();
  await expect(modal).not.toBeVisible();
  expect(await resizedTable?.evaluate((element) => element.isConnected)).toBe(true);
  await expect.poll(() => getWidth(name)).toBeCloseTo(resizedWidth, 1);

  await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
  await modal.getByRole('button', { name: 'Move Name down' }).click();
  await modal.getByRole('button', { exact: true, name: 'Save' }).click();
  await expect(modal).not.toBeVisible();
  expect(await resizedTable?.evaluate((element) => element.isConnected)).toBe(false);
  await expect.poll(() => getWidth(name)).toBeCloseTo(resizedWidth, 1);
  await expect(table.locator('thead th#namespace + th#name')).toBeVisible();

  await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
  await modal.getByRole('button', { name: 'Restore default columns' }).click();
  await modal.getByRole('button', { exact: true, name: 'Save' }).click();
  await expect(modal).not.toBeVisible();
  await expect.poll(() => getWidth(name)).toBeCloseTo(resizedWidth, 1);
  await expect(columnWidthResetButton(page)).toBeEnabled();
};

test.describe('Column management and resizing', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupPlansIntercepts(page);
    await setupProvidersIntercepts(page);
  });

  for (const resource of [
    { kind: 'Provider', title: 'Providers' },
    { kind: 'Plan', title: 'Migration plans' },
  ]) {
    test(`${resource.kind}: visibility changes remeasure default widths and keep actions compact`, async ({
      page,
    }) => {
      await test.step(`open the ${resource.title} list`, async () => {
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
      });
      const table = page.getByRole('grid', { exact: true, name: resource.title });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();

      for (const width of VIEWPORT_WIDTHS) {
        await test.step(`visibility remeasure at ${width}px`, async () => {
          await assertVisibilityRemeasuresWidths({ page, resource, table, width });
        });
      }
    });

    test(`${resource.kind}: cancel preserves resized widths and reordering keeps widths by column ID`, async ({
      page,
    }) => {
      await test.step(`open the ${resource.title} list`, async () => {
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
      });
      const table = page.getByRole('grid', { exact: true, name: resource.title });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();

      for (const width of VIEWPORT_WIDTHS) {
        await test.step(`cancel and reorder at ${width}px`, async () => {
          await assertCancelAndReorderKeepWidths({ page, resource, table, width });
        });
      }
    });
  }
});
