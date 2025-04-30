import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import type { V1beta1Plan } from '@kubev2v/types';
import { Flex, FlexItem } from '@patternfly/react-core';

import SpecVirtualMachinesActionsDropdown from './SpecVirtualMachinesActionsDropdown';

type SpecVirtualMachinesActionsProps = {
  plan: V1beta1Plan;
  vmIndex: number;
};

const SpecVirtualMachinesActions: FC<SpecVirtualMachinesActionsProps> = ({ plan, vmIndex }) => {
  return (
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }} />

      <FlexItem align={{ default: 'alignRight' }}>
        <ModalHOC>
          <SpecVirtualMachinesActionsDropdown plan={plan} vmIndex={vmIndex} />
        </ModalHOC>
      </FlexItem>
    </Flex>
  );
};

export default SpecVirtualMachinesActions;
