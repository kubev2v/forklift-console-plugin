import type { ReactElement } from 'react';

import { Button, ButtonVariant, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ArrowsAltHIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import { useTableColumnWidthContext } from './TableColumnWidthContext';

const ResetColumnWidthsToolbar = (): ReactElement | null => {
  const { t } = useForkliftTranslation();
  const { enabled, hasKnownColumnWidths, resetAllColumnWidths } = useTableColumnWidthContext();
  const label = t('Reset column widths');

  if (!enabled) {
    return null;
  }

  return (
    <ToolbarItem>
      <Tooltip content={label}>
        <span>
          <Button
            aria-label={label}
            data-testid="reset-column-widths-button"
            icon={<ArrowsAltHIcon />}
            isDisabled={!hasKnownColumnWidths}
            onClick={resetAllColumnWidths}
            variant={ButtonVariant.plain}
          />
        </span>
      </Tooltip>
    </ToolbarItem>
  );
};

export default ResetColumnWidthsToolbar;
