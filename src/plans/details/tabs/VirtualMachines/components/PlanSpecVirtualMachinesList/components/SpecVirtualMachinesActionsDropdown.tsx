import { type FC, type Ref, useState } from 'react';

import type { ProviderType, V1beta1Plan } from '@forklift-ui/types';
import { Dropdown, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

import SpecVirtualMachinesActionsDropdownItems from './SpecVirtualMachinesActionsDropdownItems';

type SpecVirtualMachinesActionsDropdownProps = {
  plan: V1beta1Plan;
  providerType?: ProviderType;
  vmIndex: number;
};

const SpecVirtualMachinesActionsDropdown: FC<SpecVirtualMachinesActionsDropdownProps> = ({
  plan,
  providerType,
  vmIndex,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = (): void => {
    setIsOpen((open) => !open);
  };

  const onSelect = (): void => {
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
      }}
      shouldFocusToggleOnSelect
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle
          data-testid="vm-actions-menu-toggle"
          isExpanded={isOpen}
          onClick={onToggleClick}
          ref={toggleRef}
          variant="plain"
        >
          <EllipsisVIcon />
        </MenuToggle>
      )}
    >
      <SpecVirtualMachinesActionsDropdownItems
        plan={plan}
        providerType={providerType}
        vmIndex={vmIndex}
      />
    </Dropdown>
  );
};

export default SpecVirtualMachinesActionsDropdown;
