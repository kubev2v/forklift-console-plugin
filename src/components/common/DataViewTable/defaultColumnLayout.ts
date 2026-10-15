import {
  COLUMN_MEASUREMENT_TOLERANCE_PX,
  DEFAULT_COLUMN_MIN_WIDTH_PX,
} from '../TableView/columnWidthConstants';
import { isValidColumnWidth } from '../TableView/columnWidthUtils';

import {
  DATA_ACTION_COLUMN_ATTR,
  DATA_COLUMN_WIDTH_SPACER_ATTR,
  DATA_COLUMN_WIDTHS_CUSTOMIZED_ATTR,
  DATA_CONTROL_COLUMN_ATTR,
  DATA_DEFAULT_COLUMN_WIDTHS_ATTR,
  DATA_RESIZABLE_COLUMN_ATTR,
  EXPANSION_COLUMN_WIDTH,
  FORKLIFT_DEFAULT_COLUMN_WIDTH_CSS_VAR,
  SELECTION_COLUMN_WIDTH,
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

const parsePx = (value: string): number => parseFloat(value);

const getControlColumnWidth = (header: HTMLTableCellElement): number => {
  const controlType = header.getAttribute(DATA_CONTROL_COLUMN_ATTR);
  if (controlType === 'expand') {
    return parsePx(EXPANSION_COLUMN_WIDTH);
  }
  if (controlType === 'select') {
    return parsePx(SELECTION_COLUMN_WIDTH);
  }
  if (header.hasAttribute(DATA_ACTION_COLUMN_ATTR)) {
    const actionControl = header.querySelector('button');
    if (actionControl) {
      const style = getComputedStyle(header);
      return (
        actionControl.getBoundingClientRect().width +
        parseFloat(style.paddingInlineStart) +
        parseFloat(style.paddingInlineEnd)
      );
    }
  }
  return header.getBoundingClientRect().width;
};

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
      controls.reduce((sum, header) => sum + getControlColumnWidth(header), 0);
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
  const clearCachedHeaderMinWidths = (): void => {
    for (const header of headers) {
      header.style.removeProperty('min-width');
    }
  };
  const clearColumnWidthVars = (): void => {
    for (const column of columns) {
      column.style.removeProperty(FORKLIFT_DEFAULT_COLUMN_WIDTH_CSS_VAR);
    }
  };
  const setColumnWidthVar = (headerIndex: number, width: number): void => {
    columns[headerIndex]?.style.setProperty(FORKLIFT_DEFAULT_COLUMN_WIDTH_CSS_VAR, `${width}px`);
  };
  const refresh = (): void => {
    if (table.getAttribute(DATA_COLUMN_WIDTHS_CUSTOMIZED_ATTR) === 'true') {
      return;
    }
    clearCachedHeaderMinWidths();
    clearColumnWidthVars();
    const controlWidths = controls.map((header) => getControlColumnWidth(header));
    const widths = measureWidths();
    for (const [index, width] of widths.entries()) {
      setColumnWidthVar(headers.indexOf(dataHeaders[index]), width);
    }
    for (const [index, control] of controls.entries()) {
      const headerIndex = headers.indexOf(control);
      if (headerIndex >= 0) {
        setColumnWidthVar(headerIndex, controlWidths[index]);
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
