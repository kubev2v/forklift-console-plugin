import { type FC, useState } from 'react';

import {
  MenuToggle,
  type MenuToggleStatus,
  Select,
  SelectList,
  type SelectProps,
} from '@patternfly/react-core';

type MtvSelectProps = Pick<SelectProps, 'onSelect' | 'children' | 'className'> & {
  id: string;
  value: string;
  status?: MenuToggleStatus;
  placeholder?: string;
  isDisabled?: boolean;
};

const MtvSelect: FC<MtvSelectProps> = ({
  children,
  className,
  id,
  isDisabled,
  onSelect,
  placeholder = '',
  status,
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Select
      isScrollable
      shouldFocusToggleOnSelect
      id={id}
      isOpen={isOpen}
      selected={value}
      className={className}
      toggle={(ref) => (
        <MenuToggle
          isFullWidth
          ref={ref}
          isDisabled={isDisabled}
          isExpanded={isOpen}
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          aria-label="Select menu toggle"
          status={status}
        >
          {value || placeholder}
        </MenuToggle>
      )}
      onOpenChange={setIsOpen}
      onSelect={(event, selectedValue) => {
        onSelect?.(event, selectedValue);
        setIsOpen(false);
      }}
    >
      <SelectList>{children}</SelectList>
    </Select>
  );
};

export default MtvSelect;
