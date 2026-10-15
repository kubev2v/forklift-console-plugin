import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { expectTableToFit } from '../../utils/resizableColumns';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const VIEWPORT_HEIGHT = 1080;
const SHRINK_DRAG_PX = 25;

const shrinkColumn = async (page: Page, header: Locator, label: string): Promise<void> => {
  const handle = header.locator(`button[aria-label="${label}"]`);
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
    for (const width of [1280, 1440, 1920]) {
      test(`${resource.kind}: shrinking and retaining only resized identity columns preserves their rendered widths at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
        await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
        const table = page.getByRole('grid', { exact: true, name: resource.title });
        await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
        await expectTableToFit(table);
        const name = table.locator('th#name');
        const project = table.locator('th#namespace');
        await shrinkColumn(page, name, 'Name');
        await shrinkColumn(page, project, 'Project');
        const nameWidth = await name.evaluate((header) => header.getBoundingClientRect().width);
        const projectWidth = await project.evaluate(
          (header) => header.getBoundingClientRect().width,
        );
        const actionsWidth = await table
          .locator('th[data-action-column="true"]')
          .evaluate((header) => header.getBoundingClientRect().width);

        await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
        const modal = page.getByTestId('manage-columns-modal');
        for (const checkbox of await modal.getByRole('checkbox').all()) {
          if (!(await checkbox.isDisabled()) && (await checkbox.isChecked())) {
            await checkbox.uncheck();
          }
        }
        await modal.getByRole('button', { exact: true, name: 'Save' }).click();
        await expect(modal).not.toBeVisible();
        await expect
          .poll(() => name.evaluate((header) => header.getBoundingClientRect().width))
          .toBeCloseTo(nameWidth, 1);
        await expect
          .poll(() => project.evaluate((header) => header.getBoundingClientRect().width))
          .toBeCloseTo(projectWidth, 1);
        await expect
          .poll(() =>
            table
              .locator('th[data-action-column="true"]')
              .evaluate((header) => header.getBoundingClientRect().width),
          )
          .toBeCloseTo(actionsWidth, 1);
        await expect
          .poll(() =>
            table
              .locator('th[data-column-width-spacer="true"]')
              .evaluate((header) => header.getBoundingClientRect().width),
          )
          .toBeGreaterThan(0);
        await expectTableToFit(table);

        await page.reload();
        await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
        await expect
          .poll(() => name.evaluate((header) => header.getBoundingClientRect().width))
          .toBeCloseTo(nameWidth, 1);
        await expect
          .poll(() => project.evaluate((header) => header.getBoundingClientRect().width))
          .toBeCloseTo(projectWidth, 1);
      });
    }
  }
});
