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

  const onToggleClick = (): void => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const onSelect = (): void => {
    setIsOpen(false);
  };

  const handleDelete = (): void => {
    onDelete(affinity);
    setIsOpen(false);
  };
  return (
    <Dropdown
      className="forklift-dropdown"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      popperProps={{
        position: 'right',
        width: '200px',
      }}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          aria-label={t('Actions')}
          isExpanded={isOpen}
          onClick={onToggleClick}
          ref={toggleRef}
          variant="plain"
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
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
