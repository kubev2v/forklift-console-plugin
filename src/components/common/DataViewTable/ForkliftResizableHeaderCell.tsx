import type { FC, ReactNode } from 'react';

import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import type { DataViewThResizableProps } from '@patternfly/react-data-view/dist/esm/DataViewTh/DataViewTh';
import { Th, type ThProps } from '@patternfly/react-table';

import { DATA_COLUMN_TITLE_PROBE_ATTR } from './dataViewTableConstants';
import ForkliftResizeHandle from './ForkliftResizeHandle';
import ResizableHeaderTitle from './ResizableHeaderTitle';

type HeaderColumn = {
  cell: ReactNode;
  props?: ThProps;
  resizableProps?: DataViewThResizableProps;
};

type ForkliftResizableHeaderCellProps = {
  column: DataViewTh;
};

const isHeaderColumn = (column: DataViewTh): column is HeaderColumn =>
  column !== null && typeof column === 'object' && 'cell' in column;

const ForkliftResizableHeaderCell: FC<ForkliftResizableHeaderCellProps> = ({ column }) => {
  const descriptor = isHeaderColumn(column) ? column : { cell: column };
  const { cell, props = {}, resizableProps } = descriptor;
  const isResizable = Boolean(resizableProps?.isResizable && props.id);
  const label = resizableProps?.resizeButtonAriaLabel ?? props.dataLabel ?? props.id ?? '';

  const title = isResizable ? (
    <ResizableHeaderTitle isSortable={Boolean(props.sort)} label={label} />
  ) : (
    cell
  );
  const additionalContent = isResizable ? (
    <>
      {props.additionalContent}
      <span
        aria-hidden="true"
        className="forklift-data-view-table__title-probe"
        {...{ [DATA_COLUMN_TITLE_PROBE_ATTR]: true }}
      >
        0000
      </span>
      <ForkliftResizeHandle
        columnId={String(props.id)}
        label={label}
        minWidth={resizableProps?.minWidth ?? 0}
      />
    </>
  ) : (
    props.additionalContent
  );

  return (
    <Th
      {...props}
      additionalContent={additionalContent}
      className={
        isResizable
          ? `${props.className ?? ''} forklift-data-view-table__resizable-header`.trim()
          : props.className
      }
      tabIndex={-1}
      tooltip={isResizable ? '' : props.tooltip}
      tooltipProps={
        isResizable
          ? { ...props.tooltipProps, isVisible: false, trigger: 'manual' }
          : props.tooltipProps
      }
    >
      {title}
    </Th>
  );
};

export default ForkliftResizableHeaderCell;
