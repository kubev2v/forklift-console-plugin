import type { FC } from 'react';
import { TableCell } from 'src/modules/Providers/utils/components/TableCell/TableCell';

import type { V1beta1PlanStatusConditions } from '@kubev2v/types';
import { Label, Level, LevelItem } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';

type PlanConditionsFieldProps = {
  conditions?: V1beta1PlanStatusConditions[];
};

const PlanConditionsField: FC<PlanConditionsFieldProps> = ({ conditions }) => {
  const condition = conditions?.[0];
  if (!condition) {
    return null;
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

export default PlanConditionsField;
