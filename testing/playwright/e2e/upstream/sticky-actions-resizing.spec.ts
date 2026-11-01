import { createRequire } from 'node:module';

import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupCoreKubernetesIntercepts } from '../../intercepts/core';
import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { resetColumnWidthsIfEnabled } from '../../utils/columnWidthControls';
import { expectReadableTableLayout } from '../../utils/resizableColumns';
import {
  expectActionsPinned,
  expectStickyCellOpaque,
  expectStickyCellToCoverData,
} from '../../utils/stickyColumns';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const SCROLLABLE_TABLE_STYLES = createRequire(__filename).resolve(
  '@patternfly/react-styles/css/components/Table/table-scrollable.css',
);
const VIEWPORT_HEIGHT = 1080;
const ENLARGE_STEPS = 20;
const GEOMETRY_PRECISION = 1;
const VIEWPORT_WIDTHS = [1280, 1440, 1920];
const SCROLL_FRACTIONS = [0, 0.5, 1];

type StickyScenario = {
  lateStyles: boolean;
  page: Page;
  resource: { kind: string; title: string };
  table: Locator;
  theme: string;
  width: number;
};

const expectStickyCoverAtEveryScrollOffset = async (
  table: Locator,
  actionsHeader: Locator,
  actions: Locator,
): Promise<void> => {
  for (const fraction of SCROLL_FRACTIONS) {
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
};

const assertStickyActionsAtWidth = async ({
  lateStyles,
  page,
  resource,
  table,
  theme,
  width,
}: StickyScenario): Promise<void> => {
  const context = { kind: resource.kind, theme, width };
  await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
  await resetColumnWidthsIfEnabled(page);
  await expectReadableTableLayout(table, {}, context);

  const handle = table.locator('th#name button[data-resize-handle="true"]');
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
  const actionsWidth = await actions.evaluate((element) => element.getBoundingClientRect().width);

  await expectStickyCoverAtEveryScrollOffset(table, actionsHeader, actions);

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

  await resetColumnWidthsIfEnabled(page);
  await expectReadableTableLayout(table, {}, context);
  await expectStickyCellOpaque(table.locator('tbody tr').first().locator('td').last());
};

test.describe('Sticky controls cover overflowing resized columns', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupCoreKubernetesIntercepts(page);
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
      test(`${resource.kind}: Actions masks data in ${theme} mode${lateStyles ? ' with late PatternFly styles' : ''}`, async ({
        page,
      }) => {
        await test.step(`open the ${resource.title} list in ${theme} mode`, async () => {
          await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
          await page.evaluate((dark): void => {
            document.documentElement.classList.toggle('pf-v6-theme-dark', dark);
          }, theme === 'dark');
        });

        const table = page.getByRole('grid', { exact: true, name: resource.title });
        await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();

        for (const width of VIEWPORT_WIDTHS) {
          await test.step(`Actions cover scrolled data at ${width}px`, async () => {
            await assertStickyActionsAtWidth({ lateStyles, page, resource, table, theme, width });
          });
        }
      });
    }
  }
});
