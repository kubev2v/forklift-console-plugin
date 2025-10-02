import { type FC, type Ref, useState } from 'react';

import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  type MenuToggleElement,
} from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

import type { AffinityRowData } from './utils/types';

import './AffinityRowActionsDropdown.scss';

type AffinityRowActionsDropdownProps = {
  affinity: AffinityRowData;
  onDelete: (affinity: AffinityRowData) => void;
  onEdit: (affinity: AffinityRowData) => void;
};

const AffinityRowActionsDropdown: FC<AffinityRowActionsDropdownProps> = ({
  affinity,
  onDelete,
  onEdit,
}) => {
  const { t } = useForkliftTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const onSelect = () => {
    setIsOpen(false);
  };

  const handleDelete = () => {
    onDelete(affinity);
    setIsOpen(false);
  };
  return (
    <Dropdown
      className="forklift-dropdown"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} variant="plain">
          <EllipsisVIcon />
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
      popperProps={{
        position: 'right',
        width: '200px',
      }}
    >
      <DropdownList>
        <DropdownItem
          key="edit"
          onClick={() => {
            onEdit(affinity);
          }}
        >
          {t('Edit')}
        </DropdownItem>
        <DropdownItem key="delete" onClick={handleDelete}>
          {t('Delete')}
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default AffinityRowActionsDropdown;
