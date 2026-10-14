import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

import { COLUMN_MEASUREMENT_TOLERANCE_PX } from '../TableView/columnWidthConstants';

import { DATA_RESIZABLE_COLUMN_ATTR } from './dataViewTableConstants';
import { createDefaultColumnLayout } from './defaultColumnLayout';

type UseDefaultColumnLayoutArgs = {
  hasCustomColumnWidths: boolean;
  layoutKey: string;
};

type UseDefaultColumnLayoutResult = {
  defaultLayoutVersion: number;
  layoutRef: RefObject<HTMLDivElement>;
};

export const useDefaultColumnLayout = ({
  hasCustomColumnWidths,
  layoutKey,
}: UseDefaultColumnLayoutArgs): UseDefaultColumnLayoutResult => {
  const layoutRef = useRef<HTMLDivElement>(null);
  const [defaultLayoutVersion, setDefaultLayoutVersion] = useState(0);

  useLayoutEffect(() => {
    const container = layoutRef.current;
    const table = container?.querySelector('table');
    if (!container || !table || hasCustomColumnWidths) {
      return undefined;
    }
    const tableHeaders = Array.from(table.tHead?.rows[0]?.cells ?? []);
    const headers = tableHeaders.filter(
      (header) => header.getAttribute(DATA_RESIZABLE_COLUMN_ATTR) === 'true',
    );
    const defaultLayout = createDefaultColumnLayout(table, container);
    let animationFrame: number | undefined;
    const needsMeasurement = (): boolean =>
      headers.some((header) => {
        const cachedWidth = parseFloat(header.style.minWidth);
        return (
          Number.isFinite(cachedWidth) &&
          Math.abs(header.getBoundingClientRect().width - cachedWidth) >
            COLUMN_MEASUREMENT_TOLERANCE_PX
        );
      });
    const refreshMeasurements = (): void => {
      animationFrame = undefined;
      if (!table.isConnected || table.dataset.columnWidthsCustomized === 'true') {
        return;
      }
      defaultLayout.refresh();
      if (needsMeasurement()) {
        setDefaultLayoutVersion((version) => version + 1);
      }
    };
    if (typeof ResizeObserver === 'undefined') {
      return defaultLayout.dispose;
    }
    const observer = new ResizeObserver(() => {
      if (table.dataset.columnWidthsCustomized === 'true') {
        return;
      }
      if ((needsMeasurement() || defaultLayout.needsRefresh()) && animationFrame === undefined) {
        // Refresh outside the observer delivery cycle to avoid ResizeObserver loops.
        animationFrame = requestAnimationFrame(refreshMeasurements);
      }
    });
    for (const header of tableHeaders) observer.observe(header);
    observer.observe(container);
    return (): void => {
      observer.disconnect();
      defaultLayout.dispose();
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [defaultLayoutVersion, hasCustomColumnWidths, layoutKey]);

  return { defaultLayoutVersion, layoutRef };
};
