import { type ReactElement, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ManageColumnsModal } from '../common/TableView/ManageColumnsModal';
import { ManageColumnsToolbarItem } from '../common/TableView/ManageColumnsToolbarItem';
import type { ResourceField } from '../common/utils/types';

type ManageColumnsToolbarProps = {
  /** Read only. The defaults used for initialization.*/
  defaultColumns: ResourceField[];
  /** Read only. State maintained by parent component. */
  resourceFields: ResourceField[];
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
}: ManageColumnsToolbarProps): ReactElement => {
  const { t } = useForkliftTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <ManageColumnsToolbarItem
      ariaLabel={t('Manage columns')}
      showDialog={() => {
        setIsOpen(true);
      }}
      tooltip={t('Manage columns')}
    >
      {isOpen ? (
        <ManageColumnsModal
          cancelLabel={t('Cancel')}
          defaultColumns={defaultColumns}
          description={t('Selected columns will be displayed in the table.')}
          onChange={setColumns}
          onClose={() => {
            setIsOpen(false);
          }}
          reorderLabel={t('Reorder')}
          resourceFields={resourceFields}
          restoreLabel={t('Restore default columns')}
          saveLabel={t('Save')}
          showModal
          title={t('Manage columns')}
        />
      ) : null}
    </ManageColumnsToolbarItem>
  );
};
