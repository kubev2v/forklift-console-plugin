import React from 'react';

import { Button, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ColumnsIcon } from '@patternfly/react-icons';

export interface ManageColumnsToolbarItemProps {
  children: React.ReactNode;
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
}

/**
 * A Toolbar button item with columns icon, uses to show the Manage Columns dialog modal.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/TableView/ManageColumnsToolbarItem.tsx)
 */
export const ManageColumnsToolbarItem = ({
  children,
  showDialog,
  ariaLabel = 'Manage Columns',
  tooltip = 'Manage Columns',
}: ManageColumnsToolbarItemProps) => {
  return (
    <ToolbarItem>
      <Tooltip content={tooltip}>
        <Button variant="plain" onClick={showDialog} aria-label={ariaLabel}>
          <ColumnsIcon />
        </Button>
      </Tooltip>
      {children}
    </ToolbarItem>
  );
};
