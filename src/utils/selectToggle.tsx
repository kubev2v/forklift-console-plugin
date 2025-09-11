import type { ReactNode, Ref } from 'react';

import { MenuToggle, type MenuToggleElement, type MenuToggleProps } from '@patternfly/react-core';

type selectToggleProps = MenuToggleProps & {
  'data-test-id'?: string;
  selected: ReactNode;
};

const selectToggle = ({
  'data-test-id': dataTestID,
  selected,
  ...menuProps
}: selectToggleProps) => {
  return (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle data-test-id={dataTestID} ref={toggleRef} {...menuProps}>
      {selected}
    </MenuToggle>
  );
};

export default selectToggle;
