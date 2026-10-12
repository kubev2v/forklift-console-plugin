import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { expectTableToFit } from '../../utils/resizableColumns';
import { V5_0_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const VIEWPORT_HEIGHT = 1080;

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

test.describe('Column visibility preserves widths', { tag: '@upstream' }, () => {
  requireVersion(test, V5_0_0);

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
    for (const width of [1280, 1440, 1920]) {
      test(`${resource.kind}: saved widths survive column visibility changes and reload at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
        const table = page.getByRole('grid', { exact: true, name: resource.title });
        await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
        await expectTableToFit(table);
        const name = table.locator('th#name');
        const status = table.locator(
          `thead th:has(button[aria-label="${resource.resizedColumn}"])`,
        );
        await name.locator('button[aria-label="Name"]').press('Shift+ArrowRight');
        await status
          .locator(`button[aria-label="${resource.resizedColumn}"]`)
          .press('Shift+ArrowRight');
        const nameWidth = await name.evaluate((header) => header.style.minWidth);
        const statusWidth = await status.evaluate((header) => header.style.minWidth);
        const nameRenderedWidth = await getRenderedWidth(name);
        const statusRenderedWidth = await getRenderedWidth(status);

        await setColumnVisibility(page, resource.resizedColumn, false);
        await expect(status).toHaveCount(0);
        await expect(name).toHaveCSS('min-width', nameWidth);
        await expectRenderedWidth(name, nameRenderedWidth);

        await setColumnVisibility(page, resource.addedColumn, true);
        const added = table.getByRole('columnheader', { name: resource.addedColumn });
        await expect(added).toBeVisible();
        await expect(name).toHaveCSS('min-width', nameWidth);
        await expectRenderedWidth(name, nameRenderedWidth);
        await added
          .locator(`button[aria-label="${resource.addedColumn}"]`)
          .press('Shift+ArrowRight');
        const addedWidth = await added.evaluate((header) => header.style.minWidth);
        const addedRenderedWidth = await getRenderedWidth(added);

        await setColumnVisibility(page, resource.resizedColumn, true);
        await expect(name).toHaveCSS('min-width', nameWidth);
        await expect(status).toHaveCSS('min-width', statusWidth);
        await expect(added).toHaveCSS('min-width', addedWidth);
        await expectRenderedWidth(name, nameRenderedWidth);
        await expectRenderedWidth(status, statusRenderedWidth);
        await expectRenderedWidth(added, addedRenderedWidth);

        await page.reload();
        await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
        await expect(name).toHaveCSS('min-width', nameWidth);
        await expect(status).toHaveCSS('min-width', statusWidth);
        await expect(added).toHaveCSS('min-width', addedWidth);
        await expectRenderedWidth(name, nameRenderedWidth);
        await expectRenderedWidth(status, statusRenderedWidth);
        await expectRenderedWidth(added, addedRenderedWidth);
      });
    }
  }
});
