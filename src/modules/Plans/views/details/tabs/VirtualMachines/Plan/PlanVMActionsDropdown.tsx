import React, { type FC, type Ref, useState } from 'react';

import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import type { PlanVMsCellProps } from '../components';

import { PlanVMActionsDropdownItems } from './PlanVMActionsDropdownItems';

const PlanVMActionsDropdown: FC<PlanVMsCellProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen((open) => !open);
  };

  const onSelect = () => {
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
      }}
    >
      <PlanVMActionsDropdownItems data={data} />
    </Dropdown>
  );
};

export default PlanVMActionsDropdown;
