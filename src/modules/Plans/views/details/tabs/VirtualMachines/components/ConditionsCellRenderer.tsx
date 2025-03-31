import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { Label, Level, LevelItem } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

import type { PlanVMsCellProps } from './PlanVMsCellProps';

export const ConditionsCellRenderer: React.FC<PlanVMsCellProps> = ({ data }) => {
  const condition = data?.conditions?.[0];
  if (!condition) {
    return <></>;
  }

  return (
    <TableCell>
      <Level hasGutter>
        <LevelItem>
          <Label isCompact color="orange" icon={<ExclamationTriangleIcon color="#F0AB00" />}>
            {condition.category}
          </Label>
        </LevelItem>
        <LevelItem>{condition.message}</LevelItem>
      </Level>
    </TableCell>
  );
};
