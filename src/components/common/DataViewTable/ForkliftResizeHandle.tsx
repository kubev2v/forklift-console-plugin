import { type FC, useId } from 'react';

import { Button, ButtonVariant } from '@patternfly/react-core';
import { ArrowsAltHIcon } from '@patternfly/react-icons';
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
        icon={<ArrowsAltHIcon />}
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
