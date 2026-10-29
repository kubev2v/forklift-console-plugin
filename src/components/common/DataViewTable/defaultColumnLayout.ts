import {
  COLUMN_MEASUREMENT_TOLERANCE_PX,
  DEFAULT_COLUMN_MIN_WIDTH_PX,
} from '../TableView/columnWidthConstants';
import { isValidColumnWidth } from '../TableView/columnWidthUtils';

import {
  DATA_COLUMN_RESIZE_ACTIVE_ATTR,
  DATA_COLUMN_WIDTH_FIXED_ATTR,
  DATA_DEFAULT_COLUMN_WIDTHS_ATTR,
  FORKLIFT_DEFAULT_COLUMN_WIDTH_CSS_VAR,
} from './dataViewTableConstants';
import {
  getControlColumnWidth,
  getFixedWidth,
  measureTableHeaders,
  parsePx,
} from './defaultColumnLayoutMeasurements';
import { allocateDefaultColumnWidths } from './defaultColumnWidthUtils';
import { getHeaderMinimumWidth } from './getHeaderMinimumWidth';
import { getLayoutPixelWidth } from './layoutPixelUtils';

type DefaultColumnLayout = {
  dispose: () => void;
  needsRefresh: () => boolean;
  refresh: () => void;
};

const hasFixedWidth = (header: HTMLTableCellElement): boolean =>
  header.getAttribute(DATA_COLUMN_WIDTH_FIXED_ATTR) === 'true';

export const createDefaultColumnLayout = (
  table: HTMLTableElement,
  container: HTMLElement,
): DefaultColumnLayout => {
  const { all: headers, controls, data: dataHeaders } = measureTableHeaders(table);
  const group = document.createElement('colgroup');
  group.setAttribute(DATA_DEFAULT_COLUMN_WIDTHS_ATTR, 'true');
  const columns = headers.map(() => group.appendChild(document.createElement('col')));
  table.prepend(group);

  const measureWidths = (): (number | undefined)[] => {
    const fixedHeaders = dataHeaders.filter(hasFixedWidth);
    const unsavedHeaders = dataHeaders.filter((header) => !hasFixedWidth(header));
    const controlWidths = controls.map(getControlColumnWidth);
    const remainingWidth =
      getLayoutPixelWidth(container) -
      controlWidths.reduce((sum, width) => sum + width, 0) -
      fixedHeaders.reduce((sum, header) => sum + getFixedWidth(header), 0);
    const unsavedWidths = allocateDefaultColumnWidths(
      remainingWidth,
      unsavedHeaders.map((header) => {
        const style = getComputedStyle(header);
        const preferredMinimum = Number(header.dataset.defaultColumnMinWidth);
        return {
          minWidth: getHeaderMinimumWidth(
            header,
            isValidColumnWidth(preferredMinimum) ? preferredMinimum : DEFAULT_COLUMN_MIN_WIDTH_PX,
          ),
          padding: parsePx(style.paddingInlineStart) + parsePx(style.paddingInlineEnd),
          weight: Number(header.dataset.defaultColumnWeight),
        };
      }),
    );
    return headers.map((header) => {
      const controlIndex = controls.indexOf(header);
      if (controlIndex >= 0) {
        return controlWidths[controlIndex];
      }
      const unsavedIndex = unsavedHeaders.indexOf(header);
      return unsavedIndex >= 0 ? unsavedWidths[unsavedIndex] : undefined;
    });
  };

  const needsRefresh = (): boolean =>
    measureWidths().some((width, index) => {
      const header = headers[index];
      if (width !== undefined && dataHeaders.includes(header) && !hasFixedWidth(header)) {
        const currentMinimum = header.style.minWidth;
        if (
          currentMinimum === '' ||
          Math.abs(width - parsePx(currentMinimum)) > COLUMN_MEASUREMENT_TOLERANCE_PX
        ) {
          return true;
        }
      }
      const priorValue = columns[index].style.getPropertyValue(
        FORKLIFT_DEFAULT_COLUMN_WIDTH_CSS_VAR,
      );
      if (width === undefined) {
        return priorValue !== '';
      }
      const priorWidth = parsePx(priorValue);
      return (
        !Number.isFinite(priorWidth) ||
        Math.abs(width - priorWidth) > COLUMN_MEASUREMENT_TOLERANCE_PX
      );
    });

  const refresh = (): void => {
    if (table.hasAttribute(DATA_COLUMN_RESIZE_ACTIVE_ATTR)) {
      return;
    }
    for (const header of headers) {
      if (!hasFixedWidth(header)) {
        header.style.removeProperty('min-width');
        header.style.removeProperty('max-width');
      }
    }
    for (const [index, width] of measureWidths().entries()) {
      const column = columns[index];
      const header = headers[index];
      if (width === undefined) {
        column.style.removeProperty(FORKLIFT_DEFAULT_COLUMN_WIDTH_CSS_VAR);
      } else {
        column.style.setProperty(FORKLIFT_DEFAULT_COLUMN_WIDTH_CSS_VAR, `${width}px`);
        if (dataHeaders.includes(header)) {
          header.style.minWidth = `${width}px`;
        }
      }
    }
  };

  refresh();
  return {
    dispose: (): void => {
      group.remove();
    },
    needsRefresh,
    refresh,
  };
};
