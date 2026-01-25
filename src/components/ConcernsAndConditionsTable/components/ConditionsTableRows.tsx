import type { FC } from 'react';

import { getCategoryStatus, getCategoryTitle } from '@components/Concerns/utils/category';
import type { V1beta1PlanStatusConditions } from '@forklift-ui/types';
import { Label } from '@patternfly/react-core';
import { Td, Tr } from '@patternfly/react-table';

type ConditionsTableRowsProps = {
  category: string;
  groupedConditions: Record<string, V1beta1PlanStatusConditions[]>;
};

const ConditionsTableRows: FC<ConditionsTableRowsProps> = ({ category, groupedConditions }) => {
  const rows = groupedConditions?.[category]?.map((condition) => (
    <Tr key={`${category}-${condition.lastTransitionTime}-key`}>
      <Td modifier="truncate">{condition.type}</Td>
      <Td>
        <Label status={getCategoryStatus(condition.category)}>
          {getCategoryTitle(condition.category)}
        </Label>
      </Td>
      <Td>{condition?.message ?? '-'}</Td>
    </Tr>
  ));

  return rows;
};

export default ConditionsTableRows;
