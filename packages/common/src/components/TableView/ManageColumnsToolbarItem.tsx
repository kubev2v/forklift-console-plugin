import React from 'react';

import { Button, ToolbarItem, Tooltip } from '@patternfly/react-core';
import { ColumnsIcon } from '@patternfly/react-icons';

export interface ManageColumnsToolbarItemProps {
  children: React.ReactNode;
  showDialog: () => void;
  tooltip?: string;
  ariaLabel?: string;
}

/**
 * Toolbar item with columns icon used to show Manage Columns dialog.
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
