import {
  COLUMN_MEASUREMENT_TOLERANCE_PX,
  DEFAULT_COLUMN_MIN_WIDTH_PX,
} from '../TableView/columnWidthConstants';
import { isValidColumnWidth } from '../TableView/columnWidthUtils';

import { allocateDefaultColumnWidths } from './defaultColumnWidthUtils';

const DEFAULT_COLUMN_WIDTH_PROPERTY = '--forklift-default-column-width';

type DefaultColumnLayout = {
  dispose: () => void;
  needsRefresh: () => boolean;
  refresh: () => void;
};

export const createDefaultColumnLayout = (
  table: HTMLTableElement,
  container: HTMLElement,
): DefaultColumnLayout => {
  const headers = Array.from(table.tHead?.rows[0]?.cells ?? []).filter(
    (header) => !header.hasAttribute('data-column-width-spacer'),
  );
  const dataHeaders = headers.filter((header) => header.dataset.resizableColumn === 'true');
  const controls = headers.filter((header) => header.dataset.resizableColumn !== 'true');
  const group = document.createElement('colgroup');
  group.dataset.defaultColumnWidths = 'true';
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
        getColumn(index).style.getPropertyValue(DEFAULT_COLUMN_WIDTH_PROPERTY),
      );
      return (
        !Number.isFinite(previous) || Math.abs(width - previous) > COLUMN_MEASUREMENT_TOLERANCE_PX
      );
    });
  const refresh = (): void => {
    if (table.dataset.columnWidthsCustomized === 'true') {
      return;
    }
    const widths = measureWidths();
    for (const [index, width] of widths.entries()) {
      getColumn(index).style.setProperty(DEFAULT_COLUMN_WIDTH_PROPERTY, `${width}px`);
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
