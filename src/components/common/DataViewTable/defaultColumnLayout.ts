import {
  COLUMN_MEASUREMENT_TOLERANCE_PX,
  DEFAULT_COLUMN_MIN_WIDTH_PX,
} from '../TableView/columnWidthConstants';
import { isValidColumnWidth } from '../TableView/columnWidthUtils';

import {
  DATA_COLUMN_WIDTH_SPACER_ATTR,
  DATA_COLUMN_WIDTHS_CUSTOMIZED_ATTR,
  DATA_DEFAULT_COLUMN_WIDTHS_ATTR,
  DATA_RESIZABLE_COLUMN_ATTR,
  FORKLIFT_DEFAULT_COLUMN_WIDTH_CSS_VAR,
} from './dataViewTableConstants';
import { allocateDefaultColumnWidths } from './defaultColumnWidthUtils';

type DefaultColumnLayout = {
  dispose: () => void;
  needsRefresh: () => boolean;
  refresh: () => void;
};

type MeasuredHeaders = {
  all: HTMLTableCellElement[];
  controls: HTMLTableCellElement[];
  data: HTMLTableCellElement[];
};

const measureTableHeaders = (table: HTMLTableElement): MeasuredHeaders =>
  Array.from(table.tHead?.rows[0]?.cells ?? []).reduce<MeasuredHeaders>(
    (acc, header) => {
      if (header.hasAttribute(DATA_COLUMN_WIDTH_SPACER_ATTR)) {
        return acc;
      }
      acc.all.push(header);
      if (header.getAttribute(DATA_RESIZABLE_COLUMN_ATTR) === 'true') {
        acc.data.push(header);
      } else {
        acc.controls.push(header);
      }
      return acc;
    },
    { all: [], controls: [], data: [] },
  );

export const createDefaultColumnLayout = (
  table: HTMLTableElement,
  container: HTMLElement,
): DefaultColumnLayout => {
  const { all: headers, controls, data: dataHeaders } = measureTableHeaders(table);
  const group = document.createElement('colgroup');
  group.setAttribute(DATA_DEFAULT_COLUMN_WIDTHS_ATTR, 'true');
  const columns = headers.map(() => group.appendChild(document.createElement('col')));
  // DataViewTableBasic does not expose a colgroup slot; this group never owns header sizing.
  table.prepend(group);

  const measureWidths = (): number[] => {
    const availableWidth =
      container.getBoundingClientRect().width -
      controls.reduce((sum, header) => sum + header.getBoundingClientRect().width, 0);
    if (availableWidth <= 0) {
      return [];
    }
    return allocateDefaultColumnWidths(
      availableWidth,
      dataHeaders.map((header) => {
        const style = getComputedStyle(header);
        const minWidth = Number(header.dataset.defaultColumnMinWidth);
        return {
          minWidth: isValidColumnWidth(minWidth) ? minWidth : DEFAULT_COLUMN_MIN_WIDTH_PX,
          padding: parseFloat(style.paddingInlineStart) + parseFloat(style.paddingInlineEnd),
          weight: Number(header.dataset.defaultColumnWeight),
        };
      }),
    );
  };
  const getColumn = (index: number): HTMLTableColElement =>
    columns[headers.indexOf(dataHeaders[index])];
  const needsRefresh = (): boolean =>
    measureWidths().some((width, index) => {
      const previous = parseFloat(
        getColumn(index).style.getPropertyValue(FORKLIFT_DEFAULT_COLUMN_WIDTH_CSS_VAR),
      );
      return (
        !Number.isFinite(previous) || Math.abs(width - previous) > COLUMN_MEASUREMENT_TOLERANCE_PX
      );
    });
  const refresh = (): void => {
    if (table.getAttribute(DATA_COLUMN_WIDTHS_CUSTOMIZED_ATTR) === 'true') {
      return;
    }
    const widths = measureWidths();
    for (const [index, width] of widths.entries()) {
      getColumn(index).style.setProperty(FORKLIFT_DEFAULT_COLUMN_WIDTH_CSS_VAR, `${width}px`);
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
