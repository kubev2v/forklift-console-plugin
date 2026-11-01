import { type FC, useCallback, useLayoutEffect, useRef, useState } from 'react';

import { Tooltip } from '@patternfly/react-core';

import { subscribeToTableLayoutChanges } from '../TableView/resizableCellLayoutEvents';
import { CLIP_TOLERANCE_PX } from '../TableView/resizableCellUtils';

import { DATA_COLUMN_TITLE_ATTR } from './dataViewTableConstants';

const HANDLE_CENTER_CSS_VAR = '--forklift-resize-handle-center';

/**
 * The resize handle is absolutely positioned in the header, so centering it in the
 * header box only lines up with the title when PatternFly's header/button paddings
 * happen to be symmetric. Anchor it to the measured title centre instead, which stays
 * exact across widths, zoom levels and RTL.
 */
const syncHandleCenterToTitle = (title: HTMLElement): void => {
  const header = title.closest('th');
  if (!header) {
    return;
  }
  const titleRect = title.getBoundingClientRect();
  const headerRect = header.getBoundingClientRect();
  const borderTop = Number.parseFloat(getComputedStyle(header).borderTopWidth) || 0;
  const center = titleRect.top - headerRect.top - borderTop + titleRect.height / 2;
  header.style.setProperty(HANDLE_CENTER_CSS_VAR, `${center}px`);
};

type ResizableHeaderTitleProps = {
  isSortable: boolean;
  label: string;
  titleId?: string;
};

const ResizableHeaderTitle: FC<ResizableHeaderTitleProps> = ({ isSortable, label, titleId }) => {
  const titleRef = useRef<HTMLSpanElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isClipped, setIsClipped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const checkClipped = useCallback((): boolean => {
    const title = titleRef.current;
    if (title) {
      syncHandleCenterToTitle(title);
    }
    const clipped = Boolean(title && title.scrollWidth - title.clientWidth > CLIP_TOLERANCE_PX);
    setIsClipped(clipped);
    if (!clipped) setIsVisible(false);
    return clipped;
  }, []);

  useLayoutEffect(() => {
    const title = titleRef.current;
    if (!title) return undefined;
    checkClipped();
    const observer =
      typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(checkClipped);
    observer?.observe(title);
    const unsubscribe = subscribeToTableLayoutChanges(checkClipped);
    window.addEventListener('resize', checkClipped);
    return (): void => {
      observer?.disconnect();
      unsubscribe();
      window.removeEventListener('resize', checkClipped);
    };
  }, [checkClipped]);

  useLayoutEffect(() => {
    if (!isSortable) return undefined;
    const sortButton = titleRef.current?.closest('button');
    if (!sortButton) return undefined;
    sortButtonRef.current = sortButton;
    const show = (): void => {
      setIsVisible(checkClipped());
    };
    const hide = (): void => {
      setIsVisible(false);
    };
    sortButton.addEventListener('mouseenter', show);
    sortButton.addEventListener('focus', show);
    sortButton.addEventListener('mouseleave', hide);
    sortButton.addEventListener('blur', hide);
    if (document.activeElement === sortButton) show();
    return (): void => {
      sortButton.removeEventListener('mouseenter', show);
      sortButton.removeEventListener('focus', show);
      sortButton.removeEventListener('mouseleave', hide);
      sortButton.removeEventListener('blur', hide);
      sortButtonRef.current = null;
    };
  }, [checkClipped, isSortable]);

  return (
    <>
      <span
        className="forklift-data-view-table__header-title"
        {...(titleId ? { id: titleId } : {})}
        {...{ [DATA_COLUMN_TITLE_ATTR]: true }}
        onBlur={() => {
          setIsVisible(false);
        }}
        onFocus={() => {
          if (!isSortable) setIsVisible(checkClipped());
        }}
        onMouseEnter={() => {
          if (!isSortable) setIsVisible(checkClipped());
        }}
        onMouseLeave={() => {
          if (!isSortable) setIsVisible(false);
        }}
        ref={titleRef}
        tabIndex={!isSortable && isClipped ? 0 : undefined}
      >
        {label}
      </span>
      {isVisible && (
        <Tooltip
          content={label}
          isVisible
          trigger="manual"
          triggerRef={isSortable ? sortButtonRef : titleRef}
        />
      )}
    </>
  );
};

export default ResizableHeaderTitle;
