import { type JSX, type Ref, useState } from 'react';

import { Dropdown, DropdownList, MenuToggle, type MenuToggleElement } from '@patternfly/react-core';
import { EllipsisVIcon } from '@patternfly/react-icons';

const HeaderActions = ({ actions }: { actions: JSX.Element[] }) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false);
  const onToggle = () => {
    setMenuIsOpen((open) => !open);
  };
  return (
    <Dropdown
      isOpen={menuIsOpen}
      onOpenChange={(isOpen: boolean) => {
        setMenuIsOpen(isOpen);
      }}
      toggle={(toggleRef: Ref<MenuToggleElement>) => (
        <MenuToggle ref={toggleRef} onClick={onToggle} isExpanded={menuIsOpen} variant={'plain'}>
          {<EllipsisVIcon />}
        </MenuToggle>
      )}
      shouldFocusFirstItemOnOpen={false}
      popperProps={{
        position: 'right',
      }}
    >
      <DropdownList>{actions}</DropdownList>
    </Dropdown>
  );
};

export default HeaderActions;
