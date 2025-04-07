import { FC, useState } from 'react';

import {
  MenuToggle,
  MenuToggleStatus,
  Select,
  SelectList,
  SelectProps,
} from '@patternfly/react-core';

type MtvSelectProps = Pick<SelectProps, 'onSelect' | 'children'> & {
  id: string;
  value: string;
  status?: MenuToggleStatus;
  placeholder?: string;
  isDisabled?: boolean;
};

export const MtvSelect: FC<MtvSelectProps> = ({
  id,
  value,
  placeholder = '',
  isDisabled,
  children,
  onSelect,
  status,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Select
      isScrollable
      id={id}
      isOpen={isOpen}
      selected={value}
      toggle={(ref) => (
        <MenuToggle
          isFullWidth
          ref={ref}
          isDisabled={isDisabled}
          isExpanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Select menu toggle"
          status={status}
        >
          {value || placeholder}
        </MenuToggle>
      )}
      onOpenChange={setIsOpen}
      onSelect={(event, value) => {
        onSelect?.(event, value);
        setIsOpen(false);
      }}
    >
      <SelectList>{children}</SelectList>
    </Select>
  );
};

export default MtvSelect;
