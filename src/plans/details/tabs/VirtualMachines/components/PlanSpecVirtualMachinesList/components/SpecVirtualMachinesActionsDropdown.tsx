import { type FC, type Ref, useState } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import SpecVirtualMachinesActionsDropdownItems from './SpecVirtualMachinesActionsDropdownItems';

type SpecVirtualMachinesActionsDropdownProps = {
  plan: V1beta1Plan;
  vmIndex: number;
};

const SpecVirtualMachinesActionsDropdown: FC<SpecVirtualMachinesActionsDropdownProps> = ({
  plan,
  vmIndex,
}) => {
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
      <SpecVirtualMachinesActionsDropdownItems plan={plan} vmIndex={vmIndex} />
    </Dropdown>
  );
};

export default SpecVirtualMachinesActionsDropdown;
