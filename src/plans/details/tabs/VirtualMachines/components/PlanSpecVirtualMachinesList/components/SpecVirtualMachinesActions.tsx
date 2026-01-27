import type { FC } from 'react';

import type { ProviderType, V1beta1Plan } from '@forklift-ui/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import SpecVirtualMachinesActionsDropdown from './SpecVirtualMachinesActionsDropdown';

type SpecVirtualMachinesActionsProps = {
  plan: V1beta1Plan;
  vmIndex: number;
  providerType: ProviderType;
};

const SpecVirtualMachinesActions: FC<SpecVirtualMachinesActionsProps> = ({
  plan,
  providerType,
  vmIndex,
}) => {
  return (
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }} />

      <FlexItem align={{ default: 'alignRight' }}>
        <SpecVirtualMachinesActionsDropdown
          plan={plan}
          vmIndex={vmIndex}
          providerType={providerType}
        />
      </FlexItem>
    </Flex>
  );
};

export default SpecVirtualMachinesActions;
