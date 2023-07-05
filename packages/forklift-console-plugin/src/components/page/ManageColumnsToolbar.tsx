import React, { useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ManageColumnsModal, ManageColumnsToolbarItem } from '@kubev2v/common';
import { ResourceField } from '@kubev2v/common';

export interface ManageColumnsToolbarProps {
  /** Read only. State maintained by parent component. */
  resourceFields: ResourceField[];
  /** Read only. The defaults used for initialization.*/
  defaultColumns: ResourceField[];
  /** Setter to modify state in the parent.*/
  setColumns(resourceFields: ResourceField[]): void;
}

/**
 * Toggles a modal dialog for managing resourceFields visibility and order.
 */
export const ManageColumnsToolbar = ({
  resourceFields,
  setColumns,
  defaultColumns,
}: ManageColumnsToolbarProps) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ManageColumnsToolbarItem
      showDialog={() => setIsOpen(true)}
      ariaLabel={t('Manage Columns')}
      tooltip={t('Manage Columns')}
    >
      <ManageColumnsModal
        showModal={isOpen}
        onClose={() => setIsOpen(false)}
        description={t('Selected columns will be displayed in the table.')}
        resourceFields={resourceFields}
        onChange={setColumns}
        defaultColumns={defaultColumns}
        saveLabel={t('Save')}
        cancelLabel={t('Cancel')}
        reorderLabel={t('Reorder')}
        restoreLabel={t('Restore default columns')}
        title={t('Manage Columns')}
      />
    </ManageColumnsToolbarItem>
  );
};
