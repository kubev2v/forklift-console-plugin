import { expect, type Locator } from '@playwright/test';

const EDGE_TOLERANCE_PX = 4;
const GAP_TOLERANCE_PX = 0.5;
const MIN_HANDLE_SIZE_PX = 31.5;
const MIN_READABLE_COLUMN_PX = 96;
const TITLE_HANDLE_GAP_PX = 8;
// PatternFly help headers shift their title slightly; allow for that gap at 150% zoom.
const VERTICAL_ALIGNMENT_TOLERANCE_PX = 3;
const WIDTH_TOLERANCE_PX = 1;

export const expectReadableTableLayout = async (table: Locator): Promise<void> => {
  await expect
    .poll(() =>
      table.evaluate(
        (element, { minimum, tolerance }) => {
          const scroller = element.parentElement;
          if (!scroller) {
            return false;
          }

          const headers = Array.from(
            element.querySelectorAll<HTMLTableCellElement>(
              'thead th[data-resizable-column="true"]',
            ),
          ).filter((header) => getComputedStyle(header).display !== 'none');
          return (
            headers.length > 0 &&
            headers.every(
              (header) => header.getBoundingClientRect().width >= minimum - tolerance,
            ) &&
            element.getBoundingClientRect().width >=
              scroller.getBoundingClientRect().width - tolerance &&
            scroller.scrollWidth >= scroller.clientWidth - tolerance
          );
        },
        { minimum: MIN_READABLE_COLUMN_PX, tolerance: WIDTH_TOLERANCE_PX },
      ),
    )
    .toBe(true);
};

export const expectEveryResizeHandleAligned = async (table: Locator): Promise<void> => {
  const headers = table.locator('thead th[data-resizable-column="true"]');
  const count = await headers.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const handle = headers.nth(index).locator('button[data-resize-handle="true"]');
    await expect(handle).toBeVisible();
    await handle.scrollIntoViewIfNeeded();
    const geometry = await handle.evaluate((button) => {
      const header = button.closest('th');
      const title = header?.querySelector<HTMLElement>('[data-column-title]');
      if (!header || !title) {
        return null;
      }

      const headerRect = header.getBoundingClientRect();
      const handleRect = button.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const sortButton = title.closest('button');
      const sortButtonRect = sortButton?.getBoundingClientRect();
      const handleCenterY = handleRect.top + handleRect.height / 2;
      const titleCenterY = titleRect.top + titleRect.height / 2;
      const rtl = getComputedStyle(header).direction === 'rtl';
      const target = document.elementFromPoint(
        handleRect.left + handleRect.width / 2,
        handleRect.top + handleRect.height / 2,
      );
      return {
        edgeGap: rtl
          ? Math.abs(handleRect.left - headerRect.left)
          : Math.abs(headerRect.right - handleRect.right),
        height: handleRect.height,
        hitTarget: button.contains(target),
        sortButtonVerticalGap: sortButtonRect
          ? Math.abs(handleCenterY - (sortButtonRect.top + sortButtonRect.height / 2))
          : null,
        titleGap: rtl ? titleRect.left - handleRect.right : handleRect.left - titleRect.right,
        titleVerticalGap: Math.abs(handleCenterY - titleCenterY),
        width: handleRect.width,
      };
    });

    expect(geometry).not.toBeNull();
    expect(geometry?.edgeGap).toBeLessThanOrEqual(EDGE_TOLERANCE_PX);
    expect(geometry?.height).toBeGreaterThanOrEqual(MIN_HANDLE_SIZE_PX);
    expect(geometry?.width).toBeGreaterThanOrEqual(MIN_HANDLE_SIZE_PX);
    expect(geometry?.titleGap).toBeGreaterThanOrEqual(TITLE_HANDLE_GAP_PX - GAP_TOLERANCE_PX);
    expect(geometry?.titleVerticalGap).toBeLessThanOrEqual(VERTICAL_ALIGNMENT_TOLERANCE_PX);
    if (typeof geometry?.sortButtonVerticalGap === 'number') {
      expect(geometry?.sortButtonVerticalGap).toBeLessThanOrEqual(VERTICAL_ALIGNMENT_TOLERANCE_PX);
    }
    expect(geometry?.hitTarget).toBe(true);
  }
};
