import { useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ManageColumnsModal } from '../common/TableView/ManageColumnsModal';
import { ManageColumnsToolbarItem } from '../common/TableView/ManageColumnsToolbarItem';
import type { ResourceField } from '../common/utils/types';

type ManageColumnsToolbarProps = {
  /** Read only. State maintained by parent component. */
  resourceFields: ResourceField[];
  /** Read only. The defaults used for initialization.*/
  defaultColumns: ResourceField[];
  /** Setter to modify state in the parent.*/
  setColumns: (resourceFields: ResourceField[]) => void;
};

/**
 * Toggles a modal dialog for managing resourceFields visibility and order.
 */
export const ManageColumnsToolbar = ({
  defaultColumns,
  resourceFields,
  setColumns,
}: ManageColumnsToolbarProps) => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ManageColumnsToolbarItem
      showDialog={() => {
        setIsOpen(true);
      }}
      ariaLabel={t('Manage columns')}
      tooltip={t('Manage columns')}
    >
      <ManageColumnsModal
        showModal={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        description={t('Selected columns will be displayed in the table.')}
        resourceFields={resourceFields}
        onChange={setColumns}
        defaultColumns={defaultColumns}
        saveLabel={t('Save')}
        cancelLabel={t('Cancel')}
        reorderLabel={t('Reorder')}
        restoreLabel={t('Restore default columns')}
        title={t('Manage columns')}
      />
    </ManageColumnsToolbarItem>
  );
};
