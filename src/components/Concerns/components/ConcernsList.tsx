import type { FC } from 'react';

import type { Concern } from '@kubev2v/types';
import { Stack, StackItem } from '@patternfly/react-core';

import { getCategoryIcon } from '../utils/category';

const ConcernList: FC<{ concerns: Concern[] }> = ({ concerns }) => (
  <Stack>
    {concerns.map((concern) => (
      <StackItem key={concern.category}>
        {getCategoryIcon(concern.category)} {concern.label}
      </StackItem>
    ))}
  </Stack>
);

export default ConcernList;
