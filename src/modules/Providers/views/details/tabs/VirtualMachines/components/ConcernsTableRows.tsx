import type { FC } from 'react';

import { getCategoryStatus, getCategoryTitle } from '@components/Concerns/utils/category';
import type { Concern } from '@kubev2v/types';
import { Label } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';

type ConcernsTableRowsProps = {
  category: string;
  groupedConcerns: Record<string, Concern[]>;
};

const ConcernsTableRows: FC<ConcernsTableRowsProps> = ({ category, groupedConcerns }) => {
  const rows = groupedConcerns?.[category]?.map((concern) => (
    <Tr key={`${category}-${concern.label}-key`}>
      <Td modifier="truncate">{concern.label}</Td>
      <Td>
        <Label status={getCategoryStatus(concern.category)}>
          {getCategoryTitle(concern.category)}
        </Label>
      </Td>
      <Td>{concern?.assessment ?? '-'}</Td>
    </Tr>
  ));
  return rows;
};

export default ConcernsTableRows;
