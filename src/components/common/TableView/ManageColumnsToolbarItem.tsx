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
  children: ReactNode;
  /**
   * A handler for clicking the button.
   */
  showDialog: () => void;
  /**
   * A tooltip content.
   */
  tooltip?: string;
  /**
   * A text describing the button.
   */
  ariaLabel?: string;
};

/**
 * A Toolbar button item with columns icon, uses to show the Manage Columns dialog modal.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/TableView/ManageColumnsToolbarItem.tsx)
 */
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
          variant={ButtonVariant.plain}
          onClick={showDialog}
          aria-label={ariaLabel ?? manageColumnsText}
        >
          <Split hasGutter>
            <SplitItem>
              <ColumnsIcon />
            </SplitItem>
            <SplitItem>{manageColumnsText}</SplitItem>
          </Split>
        </Button>
      </Tooltip>
      {children}
    </ToolbarItem>
  );
};
