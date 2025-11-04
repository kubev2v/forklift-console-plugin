import type { ReactNode } from 'react';

import type { ResourceField } from '@components/common/utils/types';

export const renderResourceRowCells = <T>(
  resourceFields: ResourceField[],
  resourceData: T,
  cellRenderer: (props: {
    resourceData: T;
    resourceFieldId: string;
    resourceFields: ResourceField[];
  }) => ReactNode,
): ReactNode[] =>
  resourceFields?.reduce<ReactNode[]>((acc, { resourceFieldId }) => {
    if (resourceFieldId) {
      acc.push(cellRenderer({ resourceData, resourceFieldId, resourceFields }));
    }
    return acc;
  }, []);
