import { expect, type Locator } from '@playwright/test';

const LAYOUT_TOLERANCE_PX = 0.01;

export const expectTableToFit = async (table: Locator): Promise<void> => {
  await expect
    .poll(() =>
      table.evaluate((element, tolerance) => {
        const container = element.parentElement;
        const tableRect = element.getBoundingClientRect();
        const containerRect = container?.getBoundingClientRect();
        const headers = Array.from(
          element.querySelectorAll<HTMLTableCellElement>('th[data-resizable-column="true"]'),
        );
        return Boolean(
          container &&
          containerRect &&
          container.scrollWidth === container.clientWidth &&
          Math.abs(tableRect.width - containerRect.width) < tolerance &&
          headers.every(
            (header) =>
              Math.abs(header.getBoundingClientRect().width - parseFloat(header.style.minWidth)) <
              tolerance,
          ),
        );
      }, LAYOUT_TOLERANCE_PX),
    )
    .toBe(true);
};

export const expectLastResizeHandleVisible = async (table: Locator): Promise<void> => {
  const handle = table
    .locator('thead th[data-resizable-column="true"]')
    .last()
    .locator('button[aria-label]');
  await expect(handle).toBeVisible();
  await expect
    .poll(() =>
      handle.evaluate((button) => {
        const rect = button.getBoundingClientRect();
        const actions = button.closest('tr')?.querySelector('th[data-action-column="true"]');
        const container = button.closest('table')?.parentElement;
        const actionsRect = actions?.getBoundingClientRect();
        const containerRect = container?.getBoundingClientRect();
        const target = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
        return Boolean(
          actionsRect &&
          containerRect &&
          rect.left >= containerRect.left &&
          rect.right <= Math.min(actionsRect.left, containerRect.right) &&
          button.contains(target),
        );
      }),
    )
    .toBe(true);
};
