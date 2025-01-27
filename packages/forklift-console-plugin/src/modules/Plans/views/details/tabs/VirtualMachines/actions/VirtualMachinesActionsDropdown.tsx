import React from 'react';
import { PlanVMsCellProps } from 'src/modules/Plans/views/details/tabs/VirtualMachines/components/PlanVMsCellProps';
import { useToggle } from 'src/modules/Providers/hooks';
import { ModalHOC } from 'src/modules/Providers/modals';

import { Flex, FlexItem } from '@patternfly/react-core';
import { Dropdown, DropdownPosition, KebabToggle } from '@patternfly/react-core/deprecated';

import { VirtualMachinesActionsDropdownItems } from './VirtualMachinesActionsDropdownItems';

import './VirtualMachinesActionsDropdown.style.css';

const VirtualMachinesActionsKebabDropdown_: React.FC<PlanVMsCellProps> = ({
  planData,
  data: vmData,
}) => {
  // Hook for managing the open/close state of the dropdown
  const [isDropdownOpen, toggle] = useToggle();

  // Returning the Dropdown component from PatternFly library
  return (
    <Dropdown
      onSelect={toggle}
      isOpen={isDropdownOpen}
      isPlain
      position={DropdownPosition.right}
      toggle={<KebabToggle id="toggle-kebab" onToggle={toggle} />}
      dropdownItems={VirtualMachinesActionsDropdownItems({ planData, vmData })}
    />
  );
};

export const VirtualMachinesActionsDropdown: React.FC<PlanVMsCellProps> = (props) => (
  <ModalHOC>
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }}></FlexItem>
      <FlexItem align={{ default: 'alignRight' }}>
        <VirtualMachinesActionsKebabDropdown_ {...props} />
      </FlexItem>
    </Flex>
  </ModalHOC>
);

export const VirtualMachinesActionsDropdownMemo = React.memo(
  VirtualMachinesActionsDropdown,
  () => true,
);
