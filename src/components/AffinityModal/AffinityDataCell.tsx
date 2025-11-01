import type { FC, ReactNode } from 'react';

import type { TableDataProps } from '@openshift-console/dynamic-plugin-sdk';
import { Td } from '@patternfly/react-table';

const AffinityDataCell: FC<TableDataProps & { children: ReactNode }> = ({
  activeColumnIDs,
  children,
  className,
  id,
}) =>
  (activeColumnIDs.has(id) || id === '') && (
    <Td data-label={id} className={className} role="gridcell">
      {children}
    </Td>
  );

export default AffinityDataCell;
