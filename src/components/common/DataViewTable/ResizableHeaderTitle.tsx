import { type FC, useCallback, useLayoutEffect, useRef, useState } from 'react';

import { Tooltip } from '@patternfly/react-core';

import { subscribeToTableLayoutChanges } from '../TableView/resizableCellLayoutEvents';

import { DATA_COLUMN_TITLE_ATTR } from './dataViewTableConstants';

type ResizableHeaderTitleProps = {
  isSortable: boolean;
  label: string;
};

const ResizableHeaderTitle: FC<ResizableHeaderTitleProps> = ({ isSortable, label }) => {
  const titleRef = useRef<HTMLSpanElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isClipped, setIsClipped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const checkClipped = useCallback((): boolean => {
    const title = titleRef.current;
    const clipped = Boolean(title && title.scrollWidth > title.clientWidth + 1);
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
