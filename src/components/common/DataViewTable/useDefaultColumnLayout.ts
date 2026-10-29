// cspell:ignore loadingdone
import { type RefObject, useLayoutEffect, useRef } from 'react';

import {
  DATA_COLUMN_RESIZE_ACTIVE_ATTR,
  DATA_COLUMN_TITLE_PROBE_ATTR,
  DATA_COLUMN_WIDTH_SPACER_ATTR,
} from './dataViewTableConstants';
import { createDefaultColumnLayout } from './defaultColumnLayout';
import { getActionControl } from './defaultColumnLayoutMeasurements';

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

  useLayoutEffect(() => {
    const container = layoutRef.current;
    const table = container?.querySelector('table');
    if (!container || !table) {
      return undefined;
    }
    const headers = Array.from(table.tHead?.rows[0]?.cells ?? []).filter(
      (header) => !header.hasAttribute(DATA_COLUMN_WIDTH_SPACER_ATTR),
    );
    const defaultLayout = createDefaultColumnLayout(table, container);
    let animationFrame: number | undefined;
    const isActive = (): boolean => table.hasAttribute(DATA_COLUMN_RESIZE_ACTIVE_ATTR);
    const refresh = (): void => {
      animationFrame = undefined;
      if (table.isConnected && !isActive()) {
        defaultLayout.refresh();
      }
    };
    const scheduleRefresh = (): void => {
      if (!isActive() && animationFrame === undefined && defaultLayout.needsRefresh()) {
        animationFrame = requestAnimationFrame(refresh);
      }
    };

    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(scheduleRefresh);
    for (const header of headers) observer?.observe(header);
    observer?.observe(container);

    const observedControls = new Set<Element>();
    const syncControlObservers = (): void => {
      const currentControls = new Set<Element>();
      for (const header of headers) {
        const controls = Array.from(
          header.querySelectorAll(`button, svg, [${DATA_COLUMN_TITLE_PROBE_ATTR}]`),
        );
        for (const element of controls) {
          currentControls.add(element);
        }
        const actionControl = getActionControl(header);
        if (actionControl) currentControls.add(actionControl.button);
      }
      for (const element of observedControls) {
        if (!currentControls.has(element)) {
          observer?.unobserve(element);
          observedControls.delete(element);
        }
      }
      for (const element of currentControls) {
        if (!observedControls.has(element)) {
          observer?.observe(element);
          observedControls.add(element);
        }
      }
    };
    syncControlObservers();

    const mutationObserver =
      typeof MutationObserver === 'undefined'
        ? undefined
        : new MutationObserver(() => {
            syncControlObservers();
            scheduleRefresh();
          });
    mutationObserver?.observe(table, {
      attributeFilter: [DATA_COLUMN_RESIZE_ACTIVE_ATTR],
      attributes: true,
      childList: true,
      subtree: true,
    });
    document.fonts?.addEventListener('loadingdone', scheduleRefresh);
    document.addEventListener('load', scheduleRefresh, true);
    window.addEventListener('resize', scheduleRefresh);

    return (): void => {
      observer?.disconnect();
      mutationObserver?.disconnect();
      document.fonts?.removeEventListener('loadingdone', scheduleRefresh);
      document.removeEventListener('load', scheduleRefresh, true);
      window.removeEventListener('resize', scheduleRefresh);
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }
      defaultLayout.dispose();
    };
  }, [hasCustomColumnWidths, layoutKey]);

  return { defaultLayoutVersion: 0, layoutRef };
};
