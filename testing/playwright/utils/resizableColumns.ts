import { expect, type Locator } from '@playwright/test';

import { formatTableLayoutContext, type TableLayoutContext } from './tableLayoutContext';

const EDGE_TOLERANCE_PX = 4;
const GAP_TOLERANCE_PX = 0.5;
const MIN_HANDLE_SIZE_PX = 31.5;
const MIN_READABLE_COLUMN_PX = 96;
const TITLE_HANDLE_GAP_PX = 8;
// PatternFly help headers shift their title slightly; allow for that gap at 150% zoom.
const VERTICAL_ALIGNMENT_TOLERANCE_PX = 3;
const WIDTH_TOLERANCE_PX = 1;

type ReadableLayoutOptions = {
  expectNoOverflow?: boolean;
  /**
   * Require a fitted layout once the scroll container itself is at least this wide.
   * The console sidebar and page padding mean a 1440 viewport leaves ~1030px of table,
   * so a viewport-based threshold asks for fit where the readable minima cannot fit.
   */
  fitWhenContainerAtLeastPx?: number;
};

export const expectReadableTableLayout = async (
  table: Locator,
  { expectNoOverflow = false, fitWhenContainerAtLeastPx }: ReadableLayoutOptions = {},
  context?: TableLayoutContext,
): Promise<void> => {
  // Returns 'ok' or a diagnostic string, so a failure reports the layout it measured
  // (table vs scroller width, overflow, narrowest column) instead of "true != false".
  const describe = (): Promise<string> =>
    table.evaluate(
      (element, { fitFrom, minimum, mustFit, tolerance }) => {
        const scroller = element.parentElement;
        if (!scroller) {
          return 'missing scroll container';
        }
        const headers = Array.from(
          element.querySelectorAll<HTMLTableCellElement>('thead th[data-resizable-column="true"]'),
        ).filter((header) => getComputedStyle(header).display !== 'none');
        const widths = headers.map((header) => header.getBoundingClientRect().width);
        const narrowest = Math.min(...widths);
        const overflow = scroller.scrollWidth - scroller.clientWidth;
        const tableWidth = element.getBoundingClientRect().width;
        const scrollerWidth = scroller.getBoundingClientRect().width;
        const requireFit =
          mustFit || (fitFrom !== undefined && scrollerWidth >= fitFrom - tolerance);
        const ok =
          headers.length > 0 &&
          narrowest >= minimum - tolerance &&
          tableWidth >= scrollerWidth - tolerance &&
          (!requireFit || overflow <= tolerance);
        const round = (value: number): string =>
          Number.isFinite(value) ? value.toFixed(1) : 'none';
        return ok
          ? 'ok'
          : `table=${round(tableWidth)} scroller=${round(scrollerWidth)} ` +
              `overflow=${round(overflow)} narrowest=${round(narrowest)} ` +
              `headers=${String(headers.length)} mustFit=${String(requireFit)}`;
      },
      {
        fitFrom: fitWhenContainerAtLeastPx,
        minimum: MIN_READABLE_COLUMN_PX,
        mustFit: expectNoOverflow,
        tolerance: WIDTH_TOLERANCE_PX,
      },
    );

  await expect
    .poll(describe, {
      message: `${formatTableLayoutContext(context)}expected a readable table layout`,
    })
    .toBe('ok');
};

export const expectEveryResizeHandleAligned = async (
  table: Locator,
  context?: TableLayoutContext,
): Promise<void> => {
  const message = formatTableLayoutContext(context);
  const headers = table.locator('thead th[data-resizable-column="true"]');
  const count = await headers.count();
  expect(count, `${message}expected at least one resizable column header`).toBeGreaterThan(0);

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
        coveredByControl: Boolean(
          target?.closest('[data-action-column="true"], [data-table-control-column]'),
        ),
        edgeGap: rtl
          ? Math.abs(handleRect.left - headerRect.left)
          : Math.abs(headerRect.right - handleRect.right),
        headerHeight: headerRect.height,
        height: handleRect.height,
        hitLabel: target
          ? [target.tagName, target.getAttribute('aria-label'), target.className]
              .filter((part) => Boolean(part))
              .join(' ')
              .slice(0, 80)
          : 'none',
        hitTarget: button.contains(target),
        sortButtonVerticalGap: sortButtonRect
          ? Math.abs(handleCenterY - (sortButtonRect.top + sortButtonRect.height / 2))
          : null,
        titleGap: rtl ? titleRect.left - handleRect.right : handleRect.left - titleRect.right,
        titleHeight: titleRect.height,
        titleVerticalGap: Math.abs(handleCenterY - titleCenterY),
        width: handleRect.width,
      };
    });

    expect(geometry, `${message}resize handle geometry is unavailable`).not.toBeNull();
    expect(geometry?.edgeGap, `${message}handle must sit on the header edge`).toBeLessThanOrEqual(
      EDGE_TOLERANCE_PX,
    );
    expect(geometry?.height, `${message}handle must be tall enough to grab`).toBeGreaterThanOrEqual(
      MIN_HANDLE_SIZE_PX,
    );
    expect(geometry?.width, `${message}handle must be wide enough to grab`).toBeGreaterThanOrEqual(
      MIN_HANDLE_SIZE_PX,
    );
    expect(
      geometry?.titleGap,
      `${message}handle must keep its distance from the column title`,
    ).toBeGreaterThanOrEqual(TITLE_HANDLE_GAP_PX - GAP_TOLERANCE_PX);
    expect(
      geometry?.titleVerticalGap,
      `${message}handle must line up with the column title (gap ${String(geometry?.titleVerticalGap)}px, ` +
        `title ${String(geometry?.titleHeight)}px, handle ${String(geometry?.height)}px, ` +
        `header ${String(geometry?.headerHeight)}px)`,
    ).toBeLessThanOrEqual(VERTICAL_ALIGNMENT_TOLERANCE_PX);
    if (typeof geometry?.sortButtonVerticalGap === 'number') {
      expect(
        geometry?.sortButtonVerticalGap,
        `${message}handle must line up with the sort button`,
      ).toBeLessThanOrEqual(VERTICAL_ALIGNMENT_TOLERANCE_PX);
    }
    // A scrolled table slides data columns under the sticky Actions/selection cells, which
    // paint above the handle by design ("keep Actions clickable"). Such a handle is not
    // expected to be the hit target; anything else covering it is a real regression.
    const isHitTarget = geometry?.hitTarget ?? false;
    const isCoveredByControl = geometry?.coveredByControl ?? false;
    expect(
      isHitTarget || isCoveredByControl,
      `${message}handle must be the hit target, but the point hits "${geometry?.hitLabel ?? 'none'}"`,
    ).toBe(true);
  }
};
