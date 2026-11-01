import { expect, test } from '@playwright/test';

import { TEST_DATA } from '../../fixtures/test-data';
import { setupForkliftIntercepts } from '../../intercepts/setupForkliftIntercepts';
import { PlanDetailsPage } from '../../page-objects/PlanDetailsPage/PlanDetailsPage';
import {
  columnWidthResetButton,
  resetColumnWidthsIfEnabled,
} from '../../utils/columnWidthControls';
import { expectReadableTableLayout } from '../../utils/resizableColumns';
import { MTV_NAMESPACE } from '../../utils/resource-manager/constants';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const VIEWPORT_HEIGHT = 1080;
const SETTLED_FRAMES = 120;
const CONTROL_WIDTH_PX = 45;
const WIDTH_TOLERANCE_PX = 1;
const VIEWPORT_WIDTHS = [1100, 1280, 1440, 1920];

test.describe('Plans table layout stability and controls', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupForkliftIntercepts(page);
  });

  test('Plans stays readable and Reset reflects overrides', async ({ page }) => {
    await test.step('open the Migration plans list', async () => {
      await page.goto('/k8s/all-namespaces/forklift.konveyor.io~v1beta1~Plan');
    });
    const table = page.getByRole('grid', { exact: true, name: 'Migration plans' });
    await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();

    for (const width of VIEWPORT_WIDTHS) {
      await test.step(`stable fit and Reset state at ${width}px`, async () => {
        const context = { kind: 'Plan', width };
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
        await resetColumnWidthsIfEnabled(page);

        const reset = columnWidthResetButton(page);
        await expect(reset).toBeVisible();
        await expect(reset).toBeDisabled();
        await expectReadableTableLayout(table, {}, context);

        await page.evaluate(() => document.fonts.ready);
        const stable = await table.evaluate(
          async (element, { frames, tolerance }): Promise<boolean> => {
            const initialWidth = element.getBoundingClientRect().width;
            const initialScrollWidth = element.parentElement?.scrollWidth;
            for (let frame = 0; frame < frames; frame += 1) {
              await new Promise<void>((resolve) => {
                requestAnimationFrame(() => {
                  resolve();
                });
              });
              const container = element.parentElement;
              if (
                !element.isConnected ||
                !container ||
                Math.abs(container.scrollWidth - (initialScrollWidth ?? 0)) > tolerance ||
                Math.abs(element.getBoundingClientRect().width - initialWidth) > tolerance
              ) {
                return false;
              }
            }
            return true;
          },
          { frames: SETTLED_FRAMES, tolerance: WIDTH_TOLERANCE_PX },
        );
        expect(stable).toBe(true);

        await table.locator('th#name button[data-resize-handle="true"]').press('Shift+ArrowRight');
        await expect(reset).toBeVisible();
        await expect(reset).toBeEnabled();
        await reset.click();
        await expect(reset).toBeVisible();
        await expect(reset).toBeDisabled();
        await expectReadableTableLayout(table, {}, context);
      });
    }
  });

  test('VM expand and selection columns stay compact', async ({ page }) => {
    const table = page.getByRole('grid', { exact: true, name: 'Virtual machines' });

    await test.step('open the plan virtual machines tab', async () => {
      const details = new PlanDetailsPage(page);
      await details.navigate(TEST_DATA.planName, MTV_NAMESPACE);
      await details.virtualMachinesTab.navigateToVirtualMachinesTab();
      await expect(table.locator('tbody > tr').first()).toBeVisible();
    });

    for (const width of VIEWPORT_WIDTHS) {
      await test.step(`compact control columns at ${width}px`, async () => {
        await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
        await resetColumnWidthsIfEnabled(page);

        const row = table.locator('tbody > tr').first();
        const expand = row.getByRole('button', { exact: true, name: 'Details' });
        await expect(expand).toBeVisible();
        await expectReadableTableLayout(table, {}, { kind: 'Virtual machines', width });
        for (const cell of [
          table.locator('thead th').nth(0),
          table.locator('thead th').nth(1),
          row.locator('td').nth(0),
          row.locator('td').nth(1),
        ]) {
          const cellWidth = await cell.evaluate((element) => element.getBoundingClientRect().width);
          expect(Math.abs(cellWidth - CONTROL_WIDTH_PX)).toBeLessThan(WIDTH_TOLERANCE_PX);
        }

        const checkbox = row.getByRole('checkbox');
        await checkbox.check();
        await expect(checkbox).toBeChecked();
        await expand.click();
        await expect(expand).toHaveAttribute('aria-expanded', 'true');
        await expectReadableTableLayout(table, {}, { kind: 'Virtual machines', width });
        const span = await table.evaluate((element) => {
          const visibleHeaders = Array.from(element.querySelectorAll('thead > tr > th')).filter(
            (header) => getComputedStyle(header).display !== 'none',
          ).length;
          const expandedRow = element.querySelector('tbody > tr:nth-child(2)');
          const cells = Array.from(expandedRow?.children ?? []) as HTMLTableCellElement[];
          return {
            actual: cells.reduce((sum, cell) => sum + cell.colSpan, 0),
            expected: visibleHeaders,
          };
        });
        expect(span.actual).toBe(span.expected);

        await table.locator('th#name button[data-resize-handle="true"]').press('Shift+ArrowRight');
        await expect(checkbox).toBeChecked();
        await expect(expand).toHaveAttribute('aria-expanded', 'true');
        const reset = columnWidthResetButton(page);
        await expect(reset).toBeEnabled();
        await reset.click();
        await expectReadableTableLayout(table, {}, { kind: 'Virtual machines', width });
        await expect(checkbox).toBeChecked();
        await expand.click();
        await expect(expand).toHaveAttribute('aria-expanded', 'false');
      });
    }
  });
});
