import React from 'react';

import {
  GreenCheckCircleIcon,
  RedExclamationCircleIcon,
  YellowExclamationTriangleIcon,
} from '@openshift-console/dynamic-plugin-sdk';
import { Flex, FlexItem } from '@patternfly/react-core';

interface OperatorStatusProps {
  status: string;
}

export const statusIcons = {
  Failure: <RedExclamationCircleIcon />,
  Successful: <GreenCheckCircleIcon />,
  Running: <YellowExclamationTriangleIcon />,
};

const statusLabels = {
  Failure: 'Failure',
  Successful: 'Successful',
  Running: 'Running',
};

const OperatorStatus: React.FC<OperatorStatusProps> = ({ status }) => {
  const Icon = statusIcons[status];
  const label = statusLabels[status] || 'Unknown';

  return (
    <Flex
      spaceItems={{ default: 'spaceItemsXs' }}
      display={{ default: 'inlineFlex' }}
      flexWrap={{ default: 'nowrap' }}
    >
      {Icon && <FlexItem>{Icon}</FlexItem>}
      <FlexItem>{label}</FlexItem>
    </Flex>
  );
};

export default OperatorStatus;
