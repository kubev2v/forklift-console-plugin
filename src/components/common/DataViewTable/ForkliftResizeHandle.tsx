import { type FC, useId } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useTableColumnWidthContext } from '../TableView/TableColumnWidthContext';

import { DATA_RESIZE_HANDLE_ATTR } from './dataViewTableConstants';
import { useColumnResizeGesture } from './useColumnResizeGesture';

type ForkliftResizeHandleProps = {
  columnId: string;
  label: string;
  minWidth: number;
};

const ForkliftResizeHandle: FC<ForkliftResizeHandleProps> = ({ columnId, label, minWidth }) => {
  const { t } = useForkliftTranslation();
  const statusId = useId();
  const { commitColumnWidths, flushPendingColumnWidths } = useTableColumnWidthContext();
  const { announcedWidth, ...handlers } = useColumnResizeGesture({
    commitColumnWidths,
    flushPendingColumnWidths,
    minWidth,
  });

  return (
    <>
      <Button
        aria-describedby={statusId}
        aria-label={t('Resize {{column}} column', { column: label })}
        className="forklift-data-view-table__resize-handle"
        data-column-id={columnId}
        {...{ [DATA_RESIZE_HANDLE_ATTR]: true }}
        icon={
          <svg
            aria-hidden="true"
            className="pf-v6-svg"
            fill="currentColor"
            height="1em"
            role="img"
            viewBox="0 0 1024 1024"
            width="1em"
          >
            <path
              d="M52.7,529.8l190.5,161.9c18.6,15.9,50.5,4.7,50.5-17.8v-324c0-22.4-31.8-33.6-50.5-17.8L52.7,494.2c-11.5,9.8-11.5,25.8,0,35.6ZM480.8,12.9h62.4v998.3h-62.4V12.9ZM971.3,529.8l-190.5,161.9c-18.6,15.9-50.5,4.7-50.5-17.8v-324c0-22.4,31.8-33.6,50.5-17.8l190.5,161.9c11.5,9.8,11.5,25.8,0,35.6Z"
              fillRule="evenodd"
            />
          </svg>
        }
        onClick={(event): void => {
          event.preventDefault();
          event.stopPropagation();
        }}
        type="button"
        variant={ButtonVariant.plain}
        {...handlers}
      />
      <span
        aria-atomic="true"
        aria-live="polite"
        className="forklift-data-view-table__resize-status"
        id={statusId}
      >
        {announcedWidth === null
          ? ''
          : t('{{width}} pixels wide', { width: Math.round(announcedWidth) })}
      </span>
    </>
  );
};

export default ForkliftResizeHandle;
