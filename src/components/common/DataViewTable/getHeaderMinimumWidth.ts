import {
  DATA_COLUMN_TITLE_ATTR,
  DATA_COLUMN_TITLE_PROBE_ATTR,
  DATA_RESIZE_HANDLE_ATTR,
  RESIZE_HANDLE_GAP_REM,
  RESIZE_HANDLE_SIZE_REM,
  RESIZE_MIN_COLUMN_WIDTH_REM,
} from './dataViewTableConstants';
import { getLayoutPixelWidth } from './layoutPixelUtils';

const toPixels = (value: string): number => Number.parseFloat(value) || 0;

const positiveWidthOr = (width: number | undefined, fallback: number): number =>
  width !== undefined && width > 0 ? width : fallback;

const getInlineMargins = (element: Element | null): number => {
  if (!element) return 0;
  const style = getComputedStyle(element);
  return toPixels(style.marginInlineStart) + toPixels(style.marginInlineEnd);
};

const getSortFootprint = (title: HTMLElement | null): number => {
  const button = title?.closest('button');
  if (!button) {
    return 0;
  }
  const style = getComputedStyle(button);
  const icon = button.querySelector('svg');
  const indicator = icon?.parentElement;
  const iconWidth = positiveWidthOr(
    indicator ? getLayoutPixelWidth(indicator) : undefined,
    icon ? getLayoutPixelWidth(icon) : 0,
  );
  return (
    iconWidth +
    getInlineMargins(indicator ?? null) +
    toPixels(style.paddingInlineStart) +
    toPixels(style.paddingInlineEnd)
  );
};

const getOtherControlFootprint = (
  header: HTMLTableCellElement,
  title: HTMLElement | null,
): number => {
  const sortButton = title?.closest('button');
  return Array.from(header.querySelectorAll<HTMLButtonElement>('button'))
    .filter((button) => button !== sortButton && !button.hasAttribute(DATA_RESIZE_HANDLE_ATTR))
    .reduce(
      (width, button) =>
        width +
        getLayoutPixelWidth(button) +
        getInlineMargins(button) +
        getInlineMargins(button.parentElement),
      0,
    );
};

export const getHeaderMinimumWidth = (
  header: HTMLTableCellElement,
  preferredMinWidth: number,
): number => {
  const rootFontSize = positiveWidthOr(
    toPixels(getComputedStyle(document.documentElement).fontSize),
    16,
  );
  const style = getComputedStyle(header);
  const title = header.querySelector<HTMLElement>(`[${DATA_COLUMN_TITLE_ATTR}]`);
  const titleProbe = header.querySelector<HTMLElement>(`[${DATA_COLUMN_TITLE_PROBE_ATTR}]`);
  const handle = header.querySelector<HTMLButtonElement>(`button[${DATA_RESIZE_HANDLE_ATTR}]`);
  const fourCharacters = positiveWidthOr(
    titleProbe ? getLayoutPixelWidth(titleProbe) : undefined,
    rootFontSize * 2,
  );
  const handleWidth = positiveWidthOr(
    handle ? getLayoutPixelWidth(handle) : undefined,
    rootFontSize * RESIZE_HANDLE_SIZE_REM,
  );
  const controlFootprint = getSortFootprint(title) + getOtherControlFootprint(header, title);
  const trailingSpace = Math.max(
    toPixels(style.paddingInlineEnd),
    handleWidth + rootFontSize * RESIZE_HANDLE_GAP_REM,
  );
  const usableMinimum =
    toPixels(style.paddingInlineStart) + fourCharacters + trailingSpace + controlFootprint;
  return Math.max(preferredMinWidth, rootFontSize * RESIZE_MIN_COLUMN_WIDTH_REM, usableMinimum);
};
