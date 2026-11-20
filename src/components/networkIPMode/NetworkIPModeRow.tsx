import type { FC } from 'react';

import { Stack, StackItem } from '@patternfly/react-core';

import NetworkIPModeField from './NetworkIPModeField';

type NetworkIPModeRowProps = {
  index: number;
  isDisabled?: boolean;
  targetNetworkFieldId: string;
};

const getNetworkIPModeFieldId = (index: number): string => `networkMap.${index}.networkIPMode`;

const NetworkIPModeRow: FC<NetworkIPModeRowProps> = ({ index, isDisabled, targetNetworkFieldId }) => (
  <Stack hasGutter>
    <StackItem>
      <NetworkIPModeField
        fieldId={getNetworkIPModeFieldId(index)}
        isDisabled={isDisabled}
        targetNetworkFieldId={targetNetworkFieldId}
      />
    </StackItem>
  </Stack>
);

export default NetworkIPModeRow;
export { getNetworkIPModeFieldId };
