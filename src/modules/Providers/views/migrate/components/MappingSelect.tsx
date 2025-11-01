import { type FC, type MouseEvent, type Ref, useState } from 'react';

import {
  MenuToggle,
  type MenuToggleElement,
  Select as PfSelect, // Custom select does not support the complex toggle being used
} from '@patternfly/react-core';

type MappingListItemProps = {
  selected: string;
  setSelected: (selected: string) => void;
  children: React.ReactNode;
};

const MappingSelect: FC<MappingListItemProps> = ({ children, selected, setSelected }) => {
  const [isOpen, setIsOpen] = useState(false);

  const onSrcToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onSrcToggleClick} isExpanded={isOpen} isFullWidth>
      {selected}
    </MenuToggle>
  );

  const onSelect = (_event: MouseEvent | undefined, value: string | number | undefined) => {
    setSelected(String(value));
  };

  return (
    <PfSelect
      role="menu"
      aria-label=""
      aria-labelledby=""
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(nextOpen: boolean) => {
        setIsOpen(nextOpen);
      }}
      toggle={toggle}
      shouldFocusToggleOnSelect
      shouldFocusFirstItemOnOpen={false}
      isScrollable
      popperProps={{ direction: 'down', enableFlip: true }}
    >
      {children}
    </PfSelect>
  );
};

export default MappingSelect;
