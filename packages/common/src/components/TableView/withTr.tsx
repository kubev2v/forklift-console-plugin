import React from 'react';

import { Tr } from '@patternfly/react-table';

import { RowProps } from './types';

export function withTr<T>(Component: React.FC<RowProps<T>>) {
  const Enhanced = (props: RowProps<T>) => (
    <Tr>
      <Component {...props} />
    </Tr>
  );
  Enhanced.displayName = `${Component.displayName || 'Component'}WithTr`;
  return Enhanced;
}
