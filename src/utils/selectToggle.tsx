import type { ReactElement, ReactNode, Ref } from 'react';

import { MenuToggle, type MenuToggleElement, type MenuToggleProps } from '@patternfly/react-core';

type SelectToggleProps = MenuToggleProps & {
  selected: ReactNode;
  testId?: string;
};

const selectToggle = ({
  selected,
  testId,
  ...menuProps
}: SelectToggleProps): ((toggleRef: Ref<MenuToggleElement>) => ReactElement) => {
  return (toggleRef: Ref<MenuToggleElement>): ReactElement => (
    <MenuToggle data-testid={testId} ref={toggleRef} {...menuProps}>
      {selected}
    </MenuToggle>
  );
};

export default selectToggle;
