import { type RefObject, useLayoutEffect, useRef, useState } from 'react';

import { COLUMN_MEASUREMENT_TOLERANCE_PX } from '../TableView/columnWidthConstants';

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
    const table = layoutRef.current?.querySelector('table');
    if (!table || hasCustomColumnWidths) {
      return undefined;
    }
    const headers = Array.from(
      table.querySelectorAll<HTMLTableCellElement>('th[data-resizable-column="true"]'),
    );
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
      if (
        table.isConnected &&
        table.dataset.columnWidthsCustomized !== 'true' &&
        needsMeasurement()
      ) {
        setDefaultLayoutVersion((version) => version + 1);
      }
    };
    const observer = new ResizeObserver(() => {
      if (table.dataset.columnWidthsCustomized === 'true') {
        return;
      }
      if (needsMeasurement() && animationFrame === undefined) {
        // Refresh outside the observer delivery cycle to avoid ResizeObserver loops.
        animationFrame = requestAnimationFrame(refreshMeasurements);
      }
    });
    for (const header of headers) observer.observe(header);
    return (): void => {
      observer.disconnect();
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [defaultLayoutVersion, hasCustomColumnWidths, layoutKey]);

  return { defaultLayoutVersion, layoutRef };
};
