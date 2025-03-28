import React, { FC, useState } from 'react';

import {
  MenuToggle,
  MenuToggleStatus,
  Select as PfSelect,
  SelectList,
  SelectProps as PfSelectProps,
} from '@patternfly/react-core';

type SelectProps = Pick<PfSelectProps, 'onSelect' | 'children'> & {
  id: string;
  value: string;
  status?: MenuToggleStatus;
  placeholder?: string;
  isDisabled?: boolean;
};

export const Select: FC<SelectProps> = ({
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
    <PfSelect
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
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      onSelect={(event, value) => {
        onSelect(event, value);
        setIsOpen(false);
      }}
    >
      <SelectList>{children}</SelectList>
    </PfSelect>
  );
};

export default Select;
