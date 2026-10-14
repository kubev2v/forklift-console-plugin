import { expect, type Locator } from '@playwright/test';

const LAYOUT_TOLERANCE_PX = 0.01;

export const expectTableToFit = async (table: Locator): Promise<void> => {
  await expect
    .poll(() =>
      table.evaluate((element, tolerance) => {
        const defaultColumnWidthsColgroupSelector = 'colgroup[data-default-column-widths="true"]';
        const forkliftDefaultColumnWidthCssVar = '--forklift-default-column-width';

        const resizableHeadersMatchLayout = (
          tableElement: HTMLTableElement,
          headers: HTMLTableCellElement[],
        ): boolean => {
          const customized = tableElement.getAttribute('data-column-widths-customized') === 'true';
          if (customized) {
            return headers.every((header) => {
              const minWidth = parseFloat(header.style.minWidth);
              return (
                Number.isFinite(minWidth) &&
                Math.abs(header.getBoundingClientRect().width - minWidth) < tolerance
              );
            });
          }

          const colgroup = tableElement.querySelector<HTMLTableColElement>(
            defaultColumnWidthsColgroupSelector,
          );
          if (!colgroup) {
            return false;
          }
          const cols = Array.from(colgroup.children) as HTMLTableColElement[];

          return headers.every((header) => {
            const row = header.parentElement;
            if (!row) {
              return false;
            }
            const headerIndex = Array.from(row.children).indexOf(header);
            if (headerIndex < 0) {
              return false;
            }
            const preferred = parseFloat(
              cols[headerIndex]?.style.getPropertyValue(forkliftDefaultColumnWidthCssVar) ?? '',
            );
            return Number.isFinite(preferred) && preferred > 0;
          });
        };

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
          resizableHeadersMatchLayout(element, headers),
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
