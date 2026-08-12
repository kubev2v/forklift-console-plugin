import type { FC, ReactNode } from 'react';

import { Content } from '@patternfly/react-core';

type ListItemWrapperProps = {
  children: ReactNode;
  noListItem: boolean;
};

const ListItemWrapper: FC<ListItemWrapperProps> = ({ children, noListItem }) => {
  if (noListItem) {
    return <>{children}</>;
  }

  return <Content component="li">{children}</Content>;
};

export default ListItemWrapper;
