import type { FC } from 'react';

import { getCategoryStatus } from '@components/Concerns/utils/category';
import type { Concern } from '@forklift-ui/types';
import { Label } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';
import { EMPTY_MSG } from '@utils/constants';

type ConcernsTableRowsProps = {
  category: string;
  groupedConcerns: Record<string, Concern[]>;
};

const ConcernsTableRows: FC<ConcernsTableRowsProps> = ({ category, groupedConcerns }) => {
  const rows = groupedConcerns?.[category]?.map((concern) => (
    <Tr key={`${category}-${concern.label}-key`}>
      <Td modifier="truncate">{concern.label}</Td>
      <Td>
        <Label status={getCategoryStatus(concern.category)}>{concern.category}</Label>
      </Td>
      <Td>{concern?.assessment ?? EMPTY_MSG}</Td>
    </Tr>
  ));
  return rows ?? null;
};

export default ConcernsTableRows;
