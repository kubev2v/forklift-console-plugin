import type { ReactNode, Ref } from 'react';

import { MenuToggle, type MenuToggleElement, type MenuToggleProps } from '@patternfly/react-core';

type selectToggleProps = MenuToggleProps & {
  testId?: string;
  selected: ReactNode;
};

const selectToggle = ({ selected, testId, ...menuProps }: selectToggleProps) => {
  return (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle data-testid={testId} ref={toggleRef} {...menuProps}>
      {selected}
    </MenuToggle>
  );
};

export default selectToggle;
