import { expect, type Locator, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { expectTableToFit } from '../../utils/resizableColumns';
import { V5_0_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const LAYOUT_TOLERANCE_PX = 1;
const VIEWPORT_HEIGHT = 1080;

const getActionWidth = (table: Locator): Promise<number> =>
  table
    .locator('thead th')
    .last()
    .evaluate((header) => header.getBoundingClientRect().width);

const expectContentSizedActions = async (table: Locator, defaultWidth: number): Promise<void> => {
  await expect(table.locator('thead th').last()).toHaveCSS(
    '--pf-v6-c-table__sticky-cell--MinWidth',
    '0',
  );
  expect(await getActionWidth(table)).toBeLessThanOrEqual(defaultWidth + LAYOUT_TOLERANCE_PX);
  await expect(table.locator('tbody tr').first().locator('td').last()).toHaveCSS(
    '--pf-v6-c-table__sticky-cell--MinWidth',
    '0',
  );
};

test.describe('Column management and resizing', { tag: '@upstream' }, () => {
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
      test(`${resource.kind}: visibility changes remeasure default widths and keep actions compact at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
        const table = page.getByRole('grid', { exact: true, name: resource.title });
        await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
        await expectTableToFit(table);
        const headerCount = await table.locator('thead th').count();
        const defaultActionWidth = await getActionWidth(table);
        await expectContentSizedActions(table, defaultActionWidth);
        if (resource.kind === 'Plan') {
          await table.locator('tbody input[type="checkbox"]').first().check();
        }
        const initialTable = await table.elementHandle();

        await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
        const modal = page.getByTestId('manage-columns-modal');
        for (const checkbox of await modal.getByRole('checkbox').all()) {
          if (!(await checkbox.isDisabled()) && (await checkbox.isChecked())) {
            await checkbox.uncheck();
          }
        }
        await modal.getByRole('button', { exact: true, name: 'Save' }).click();
        await expect(modal).not.toBeVisible();
        expect(await initialTable?.evaluate((element) => element.isConnected)).toBe(false);
        await expectTableToFit(table);
        await expectContentSizedActions(table, defaultActionWidth);
        const managedTable = await table.elementHandle();
        await page.getByRole('button', { exact: true, name: 'Reset column widths' }).click();
        expect(await managedTable?.evaluate((element) => element.isConnected)).toBe(true);

        const actions = table.locator('tbody tr').first().locator('td').last();
        await actions.getByRole('button').first().click();
        await expect(page.getByRole('menu')).toBeVisible();
        await page.keyboard.press('Escape');

        await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
        await modal.getByRole('button', { name: 'Restore default columns' }).click();
        await modal.getByRole('button', { name: 'Restore default columns' }).click();
        expect(await managedTable?.evaluate((element) => element.isConnected)).toBe(true);
        await modal.getByRole('button', { exact: true, name: 'Save' }).click();
        await expect(modal).not.toBeVisible();
        await expect(table.locator('thead th')).toHaveCount(headerCount);
        await expectTableToFit(table);
        await expectContentSizedActions(table, defaultActionWidth);
        if (resource.kind === 'Plan') {
          await expect(table.locator('tbody input[type="checkbox"]').first()).toBeChecked();
        }
      });

      test(`${resource.kind}: cancel preserves resized widths and reordering keeps widths by column ID at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
        const table = page.getByRole('grid', { exact: true, name: resource.title });
        await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
        await expectTableToFit(table);
        const name = table.locator('th#name');
        await name.locator('button[aria-label="Name"]').press('Shift+ArrowRight');
        const resizedWidth = await name.evaluate((header) => header.style.minWidth);
        const resizedTable = await table.elementHandle();

        await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
        const modal = page.getByTestId('manage-columns-modal');
        await modal.getByRole('button', { name: 'Restore default columns' }).click();
        await modal.getByRole('button', { exact: true, name: 'Cancel' }).click();
        await expect(modal).not.toBeVisible();
        expect(await resizedTable?.evaluate((element) => element.isConnected)).toBe(true);
        await expect(name).toHaveCSS('min-width', resizedWidth);

        await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
        await modal.getByRole('button', { name: 'Move Name down' }).click();
        await modal.getByRole('button', { exact: true, name: 'Save' }).click();
        await expect(modal).not.toBeVisible();
        expect(await resizedTable?.evaluate((element) => element.isConnected)).toBe(false);
        await expect(name).toHaveCSS('min-width', resizedWidth);
        await expect(table.locator('thead th#namespace + th#name')).toBeVisible();
      });
    }
  }
});
