import type { FC } from 'react';

import type { Concern, V1beta1PlanStatusConditions } from '@kubev2v/types';
import { Stack, StackItem } from '@patternfly/react-core';

import { getCategoryIcon } from '../utils/category';

const ConcernList: FC<{ concerns: Concern[]; conditions: V1beta1PlanStatusConditions[] }> = ({
  concerns,
  conditions,
}) => (
  <Stack>
    {concerns.map((concern) => (
      <StackItem key={concern.category}>
        {getCategoryIcon(concern.category)} {concern.label}
      </StackItem>
    ))}
    {conditions.map((condition) => (
      <StackItem key={condition.category}>
        {getCategoryIcon(condition.category)} {condition.message}
      </StackItem>
    ))}
  </Stack>
);

export default ConcernList;
