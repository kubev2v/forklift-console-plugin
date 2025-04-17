import type { FC } from 'react';
import PlanActionsDropdown from 'src/modules/Plans/actions/PlanActionsDropdown';

import { Flex, FlexItem } from '@patternfly/react-core';

import type { PlanFieldProps } from '../utils/types';

const PlanActions: FC<PlanFieldProps> = ({ plan }) => (
  <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
    <FlexItem grow={{ default: 'grow' }} />

    <FlexItem align={{ default: 'alignRight' }}>
      <PlanActionsDropdown isKebab plan={plan} />
    </FlexItem>
  </Flex>
);

export default PlanActions;
