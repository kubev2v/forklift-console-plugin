import { expect, type Locator, type Page, test } from '@playwright/test';

import { setupPlansIntercepts } from '../../intercepts/plans';
import { setupProvidersIntercepts } from '../../intercepts/providers';
import { expectTableToFit } from '../../utils/resizableColumns';
import { V5_1_0 } from '../../utils/version/constants';
import { requireVersion } from '../../utils/version/version';

const VIEWPORT_HEIGHT = 1080;
const LARGE_DRAG_PX = 500;
const KEYBOARD_MINIMUM_PX = 100;
const KEYBOARD_SHIFT_INCREMENT_PX = 25;

const getWidth = (header: Locator): Promise<number> =>
  header.evaluate((element) => element.getBoundingClientRect().width);

const resizeName = async (page: Page, header: Locator, gesture: string): Promise<void> => {
  const handle = header.locator('button[aria-label="Name"]');
  if (gesture === 'mouse') {
    const box = await handle.boundingBox();
    if (!box) {
      throw new Error('The Name resize handle is not visible');
    }
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + LARGE_DRAG_PX, y, { steps: 10 });
    await page.mouse.up();
    await expect.poll(() => getWidth(header)).toBeGreaterThan(LARGE_DRAG_PX);
    return;
  }
  const maxKeyboardSteps = Math.ceil((await getWidth(header)) / KEYBOARD_SHIFT_INCREMENT_PX) + 1;
  for (let step = 0; step < maxKeyboardSteps; step += 1) {
    await handle.press('Shift+ArrowLeft');
    if ((await getWidth(header)) < KEYBOARD_MINIMUM_PX) {
      break;
    }
  }
  await expect.poll(() => getWidth(header)).toBeLessThan(KEYBOARD_MINIMUM_PX);
};

const setVisibility = async (page: Page, column: string, visible: boolean): Promise<void> => {
  await page.getByRole('button', { exact: true, name: 'Manage columns' }).click();
  const modal = page.getByTestId('manage-columns-modal');
  await modal.getByRole('checkbox', { exact: true, name: column }).setChecked(visible);
  await modal.getByRole('button', { exact: true, name: 'Save' }).click();
  await expect(modal).not.toBeVisible();
};

const expectWidth = async (header: Locator, width: number): Promise<void> => {
  await expect.poll(() => getWidth(header)).toBeCloseTo(width, 1);
};

test.describe('PatternFly rendered widths survive persistence', { tag: '@upstream' }, () => {
  requireVersion(test, V5_1_0);

  test.beforeEach(async ({ page }) => {
    await setupPlansIntercepts(page);
    await setupProvidersIntercepts(page);
  });

  for (const resource of [
    { added: 'Clusters', hidden: 'Status', kind: 'Provider', title: 'Providers' },
    { added: 'Description', hidden: 'Migration status', kind: 'Plan', title: 'Migration plans' },
  ]) {
    for (const width of [1280, 1440, 1920]) {
      for (const gesture of ['mouse', 'keyboard']) {
        test(`${resource.kind}: ${gesture} resize keeps its displayed width when columns change at ${width}px`, async ({
          page,
        }) => {
          await page.setViewportSize({ height: VIEWPORT_HEIGHT, width });
          await page.goto(`/k8s/all-namespaces/forklift.konveyor.io~v1beta1~${resource.kind}`);
          const table = page.getByRole('grid', { exact: true, name: resource.title });
          await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
          await expectTableToFit(table);
          const name = table.locator('th#name');
          await resizeName(page, name, gesture);
          const resizedWidth = await getWidth(name);

          await setVisibility(page, resource.hidden, false);
          await expectWidth(name, resizedWidth);
          await setVisibility(page, resource.added, true);
          await expectWidth(name, resizedWidth);
          await setVisibility(page, resource.hidden, true);
          await expectWidth(name, resizedWidth);

          await page.reload();
          await expect(table.locator('tbody').getByRole('link').first()).toBeVisible();
          await expectWidth(name, resizedWidth);
        });
      }
    }
  }
});
