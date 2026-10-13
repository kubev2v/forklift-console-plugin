import { createRequire } from 'node:module';

import { expect, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { expectTableToFit } from '../../utils/resizableColumns';
import {
  expectActionsPinned,
  expectStickyCellOpaque,
  expectStickyCellToCoverData,
} from '../../utils/stickyColumns';
import { V5_0_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const SCROLLABLE_TABLE_STYLES = createRequire(__filename).resolve(
  '@patternfly/react-styles/css/components/Table/table-scrollable.css',
);
const VIEWPORT_HEIGHT = 1080;
const ENLARGE_STEPS = 20;
const GEOMETRY_PRECISION = 1;

test.describe('Sticky controls cover overflowing resized columns', { tag: '@upstream' }, () => {
  requireVersion(test, V5_0_0);

  test.beforeEach(async ({ page }) => {
    await setupPlansIntercepts(page);
    await setupProvidersIntercepts(page);
  });

  for (const resource of [
    { kind: 'Provider', title: 'Providers' },
    { kind: 'Plan', title: 'Migration plans' },
  ]) {
    for (const { lateStyles, theme } of [
      { lateStyles: false, theme: 'light' },
      { lateStyles: false, theme: 'dark' },
      { lateStyles: true, theme: 'light' },
      { lateStyles: true, theme: 'dark' },
    ]) {
      for (const width of [1280, 1440, 1920]) {
        test(`${resource.kind}: Actions masks data in ${theme} mode at ${width}px${lateStyles ? ' with late PatternFly styles' : ''}`, async ({
          page,
        }) => {
          await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
          await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
          const table = page.getByRole('grid', { exact: true, name: resource.title });
          await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
          await page.evaluate((dark): void => {
            document.documentElement.classList.toggle('pf-v6-theme-dark', dark);
          }, theme === 'dark');
          await expectTableToFit(table);
          const handle = table.locator('th#name button[aria-label="Name"]');
          for (let step = 0; step < ENLARGE_STEPS; step += 1) {
            await handle.press('Shift+ArrowRight');
          }
          const nameWidth = await table
            .locator('th#name')
            .evaluate((element) => element.getBoundingClientRect().width);
          const actionsHeader = table.locator('th[data-action-column="true"]');
          const actions = table.locator('tbody tr').first().locator('td').last();
          if (lateStyles) {
            await page.addStyleTag({ path: SCROLLABLE_TABLE_STYLES });
            // Older DataViewTh versions replace custom header classes; the marker must suffice.
            await actionsHeader.evaluate((element): void => {
              element.classList.remove('forklift-data-view-table__sticky-cell');
            });
          }
          const actionsWidth = await actions.evaluate(
            (element) => element.getBoundingClientRect().width,
          );
          for (const fraction of [0, 0.5, 1]) {
            const overflow = await table.evaluate((element, scrollFraction): number => {
              const scroller = element.parentElement;
              if (!scroller) {
                throw new Error('The table scroll container is missing');
              }
              const maximum = scroller.scrollWidth - scroller.clientWidth;
              scroller.scrollLeft = maximum * scrollFraction;
              return maximum;
            }, fraction);
            expect(overflow).toBeGreaterThan(0);
            await expectStickyCellOpaque(actionsHeader);
            await expectStickyCellOpaque(actions);
            await expectActionsPinned(actionsHeader);
            await expectActionsPinned(actions);
            await expectStickyCellToCoverData(actions);
            await expectStickyCellToCoverData(actionsHeader);
          }
          if (resource.kind === 'Plan') {
            const selection = table.locator('tbody tr').first().locator('td').first();
            await expectStickyCellOpaque(selection);
            await selection.getByRole('checkbox').check();
            await expect(selection.getByRole('checkbox')).toBeChecked();
            await expectStickyCellOpaque(selection);
            await expectStickyCellOpaque(actions);
            await expectStickyCellToCoverData(actions);
          }
          const toggle = actions.getByRole('button');
          await toggle.click();
          await expect(toggle).toHaveAttribute('aria-expanded', 'true');
          await page.keyboard.press('Escape');
          await expect(toggle).toHaveAttribute('aria-expanded', 'false');
          await expect
            .poll(() =>
              table.locator('th#name').evaluate((element) => element.getBoundingClientRect().width),
            )
            .toBeCloseTo(nameWidth, GEOMETRY_PRECISION);
          await expect
            .poll(() => actions.evaluate((element) => element.getBoundingClientRect().width))
            .toBeCloseTo(actionsWidth, GEOMETRY_PRECISION);
          await page.getByRole('button', { exact: true, name: 'Reset column widths' }).click();
          await expectTableToFit(table);
          await expectStickyCellOpaque(table.locator('tbody tr').first().locator('td').last());
        });
      }
    }
  }
});
