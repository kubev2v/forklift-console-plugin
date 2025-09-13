import { type FC, type Ref, useState } from 'react';

import type { ProviderType, V1beta1Plan } from '@kubev2v/types';
import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import SpecVirtualMachinesActionsDropdownItems from './SpecVirtualMachinesActionsDropdownItems';

type SpecVirtualMachinesActionsDropdownProps = {
  plan: V1beta1Plan;
  vmIndex: number;
  providerType: ProviderType;
};

const SpecVirtualMachinesActionsDropdown: FC<SpecVirtualMachinesActionsDropdownProps> = ({
  plan,
  providerType,
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
        <MenuToggle
          ref={toggleRef}
          onClick={onToggleClick}
          isExpanded={isOpen}
          variant="plain"
          data-testid="vm-actions-menu-toggle"
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
      shouldFocusToggleOnSelect
      popperProps={{
        position: 'right',
      }}
    >
      <SpecVirtualMachinesActionsDropdownItems
        plan={plan}
        vmIndex={vmIndex}
        providerType={providerType}
      />
    </Dropdown>
  );
};

export default SpecVirtualMachinesActionsDropdown;
