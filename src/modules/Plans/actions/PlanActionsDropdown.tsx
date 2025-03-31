import React, { type Ref } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Dropdown, DropdownList, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import type { CellProps } from '../views/list/components';

import { PlanActionsDropdownItems } from './PlanActionsDropdownItems';

import './PlanActionsDropdown.style.css';

const PlanActionsKebabDropdown_: React.FC<PlanActionsDropdownProps> = ({ data, isKebab }) => {
  const { t } = useForkliftTranslation();

  // Hook for managing the open/close state of the dropdown
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggleClick = () => {
    setIsOpen((isOpen) => !isOpen);
  };

  const onSelect = (_event: React.MouseEvent | undefined, _value: string | number | undefined) => {
    setIsOpen(false);
  };

  // Returning the Dropdown component from PatternFly library
  return (
    <Dropdown
      className={isKebab ? undefined : 'forklift-dropdown'}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onSelect={onSelect}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          variant={isKebab ? 'plain' : 'default'}
        >
          {isKebab ? <EllipsisVIcon /> : t('Actions')}
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
      popperProps={{
        position: 'right',
      }}
    >
      <DropdownList>{PlanActionsDropdownItems({ data })}</DropdownList>
    </Dropdown>
  );
};

export const PlanActionsDropdown: React.FC<PlanActionsDropdownProps> = (props) => (
  <ModalHOC>
    <PlanActionsKebabDropdown_ {...props} />
  </ModalHOC>
);

export type PlanActionsDropdownProps = {
  isKebab?: boolean;
} & CellProps;
