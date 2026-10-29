import { type FC, useState } from 'react';

import { Tooltip } from '@patternfly/react-core';
import { Td, type TdProps } from '@patternfly/react-table';

import ColumnWidthSpacer from '../DataViewTable/ColumnWidthSpacer';
import { getActionCellProps } from '../DataViewTable/dataViewColumnUtils';
import type { ResourceField } from '../utils/types';

import { useTableColumnWidthContext } from './TableColumnWidthContext';
import { useResizableCellDisclosure } from './useResizableCellDisclosure';

import './resizable-td.scss';

type ResizableTdProps = TdProps & {
  columnId: string | null;
  resourceFields?: ResourceField[];
};

const ResizableTd: FC<ResizableTdProps> = ({
  children,
  className,
  columnId,
  onBlur,
  onFocus,
  onMouseEnter,
  onMouseLeave,
  resourceFields,
  tabIndex,
  tooltip,
  ...rest
}) => {
  const { enabled } = useTableColumnWidthContext();
  const isAction = Boolean(
    resourceFields?.some((field) => field.resourceFieldId === columnId && field.isAction),
  );
  const shouldTruncate = enabled && !isAction;
  const { cellRef, disclosure, measure } = useResizableCellDisclosure(shouldTruncate);
  const [showFullText, setShowFullText] = useState(false);
  const isLastColumn = resourceFields?.[resourceFields.length - 1]?.resourceFieldId === columnId;
  const hasActions = resourceFields?.some((field) => field.isAction);
  const actionCellProps = isAction ? getActionCellProps() : undefined;
  const cellClassName = [
    className,
    actionCellProps?.className,
    shouldTruncate && 'forklift-resizable-cell',
  ]
    .filter(Boolean)
    .join(' ');
  const tooltipContent = tooltip === undefined || tooltip === '' ? disclosure.text : tooltip;

  const revealFullText = (): void => {
    const next = measure();
    setShowFullText(next.clipped && next.text !== '');
  };

  let cellTabIndex = tabIndex;
  if (isAction) {
    cellTabIndex = -1;
  }
  if (shouldTruncate) {
    cellTabIndex = disclosure.clipped && !disclosure.interactive ? 0 : -1;
  }

  return (
    <>
      {enabled && isAction && <ColumnWidthSpacer />}
      <Td
        {...(isAction ? actionCellProps : { modifier: enabled ? undefined : 'nowrap' })}
        {...rest}
        {...(cellTabIndex === undefined ? {} : { tabIndex: cellTabIndex })}
        className={cellClassName || undefined}
        data-clipped={shouldTruncate ? disclosure.clipped : undefined}
        data-column-id={columnId ?? undefined}
        onBlur={(event): void => {
          onBlur?.(event);
          if (shouldTruncate && !event.currentTarget.matches(':hover')) {
            setShowFullText(false);
          }
        }}
        onFocus={(event): void => {
          onFocus?.(event);
          if (shouldTruncate) {
            revealFullText();
          }
        }}
        onMouseEnter={(event): void => {
          onMouseEnter?.(event);
          if (shouldTruncate) {
            revealFullText();
          }
        }}
        onMouseLeave={(event): void => {
          onMouseLeave?.(event);
          if (shouldTruncate && !event.currentTarget.contains(document.activeElement)) {
            setShowFullText(false);
          }
        }}
        ref={cellRef}
        tooltip={shouldTruncate ? null : tooltip}
      >
        {children}
      </Td>
      {shouldTruncate &&
        disclosure.clipped &&
        showFullText &&
        tooltipContent !== null &&
        tooltipContent !== '' && (
          <Tooltip content={tooltipContent} isVisible triggerRef={cellRef} />
        )}
      {enabled && !hasActions && isLastColumn && <ColumnWidthSpacer />}
    </>
  );
};

export default ResizableTd;
