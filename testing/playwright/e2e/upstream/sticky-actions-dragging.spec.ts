import { createRequire } from 'node:module';

import { expect, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
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
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 1080;
const DRAG_DELTAS = [100, 500];

test.describe('Sticky Actions during mouse resizing', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  for (const resource of [
    { kind: 'Provider', title: 'Providers' },
    { kind: 'Plan', title: 'Migration plans' },
  ]) {
    test(`${resource.kind}: data stays covered while dragging with late PatternFly styles`, async ({
      page,
    }) => {
      await setupPlansIntercepts(page);
      await setupProvidersIntercepts(page);
      await page.setViewportSize({ height: VIEWPORT_HEIGHT, width: VIEWPORT_WIDTH });
      await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
      const table = page.getByRole('grid', { exact: true, name: resource.title });
      await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
      await expectReadableTableLayout(table);
      await page.addStyleTag({ path: SCROLLABLE_TABLE_STYLES });
      const handle = table.locator('th#name button[data-resize-handle="true"]');
      const box = await handle.boundingBox();
      if (!box) {
        throw new Error('The Name resize handle is not visible');
      }
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      const header = table.locator('th[data-action-column="true"]');
      const actions = table.locator('tbody tr').first().locator('td').last();
      await page.mouse.move(x, y);
      await page.mouse.down();
      for (const delta of DRAG_DELTAS) {
        await page.mouse.move(x + delta, y, { steps: 5 });
        await expectStickyCellOpaque(header);
        await expectStickyCellOpaque(actions);
        await expectActionsPinned(header);
        await expectActionsPinned(actions);
        await expectStickyCellToCoverData(actions);
      }
      await page.mouse.up();
      await expectStickyCellToCoverData(actions);
      const toggle = actions.getByRole('button');
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'true');
      await page.keyboard.press('Escape');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  }
});
