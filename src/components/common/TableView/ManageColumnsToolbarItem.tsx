import type { ReactNode } from 'react';

import {
  Button,
  ButtonVariant,
  Split,
  SplitItem,
  ToolbarItem,
  Tooltip,
} from '@patternfly/react-core';
import { ColumnsIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

type ManageColumnsToolbarItemProps = {
  /**
   * A text describing the button.
   */
  ariaLabel?: string;
  children: ReactNode;
  /**
   * A handler for clicking the button.
   */
  showDialog: () => void;
  /**
   * A tooltip content.
   */
  tooltip?: string;
};

export const ManageColumnsToolbarItem = ({
  ariaLabel,
  children,
  showDialog,
  tooltip,
}: ManageColumnsToolbarItemProps) => {
  const { t } = useForkliftTranslation();
  const manageColumnsText = t('Manage columns');
  return (
    <ToolbarItem>
      <Tooltip content={tooltip ?? manageColumnsText}>
        <Button
          aria-label={ariaLabel ?? manageColumnsText}
          data-testid="manage-columns-button"
          icon={
            <Split hasGutter>
              <SplitItem>
                <ColumnsIcon />
              </SplitItem>
              <SplitItem>{manageColumnsText}</SplitItem>
            </Split>
          }
          onClick={showDialog}
          variant={ButtonVariant.plain}
        />
      </Tooltip>
      {children}
    </ToolbarItem>
  );
};
