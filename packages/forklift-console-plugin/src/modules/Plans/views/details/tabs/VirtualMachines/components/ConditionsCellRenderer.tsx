import React from 'react';
import { TableCell } from 'src/modules/Providers/utils';

import { YellowExclamationTriangleIcon } from '@openshift-console/dynamic-plugin-sdk';
import { Label, Level, LevelItem } from '@patternfly/react-core';

import { PlanVMsCellProps } from './PlanVMsCellProps';

export const ConditionsCellRenderer: React.FC<PlanVMsCellProps> = ({ data }) => {
  const condition = data?.conditions?.[0];
  if (!condition) {
    return <></>;
  }

  return (
    <TableCell>
      <Level hasGutter>
        <LevelItem>
          <Label isCompact color="orange" icon={<YellowExclamationTriangleIcon />}>
            {condition.category}
          </Label>
        </LevelItem>
        <LevelItem>{condition.message}</LevelItem>
      </Level>
    </TableCell>
  );
};
