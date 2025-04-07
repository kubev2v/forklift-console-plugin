import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';

import { Flex, FlexItem } from '@patternfly/react-core';

import type { PlanVMsCellProps } from '../components/PlanVMsCellProps';

import PlanVMActionsDropdown from './PlanVMActionsDropdown';

const ActionsCell: FC<PlanVMsCellProps> = ({ data: vm }) => {
  return (
    <Flex flex={{ default: 'flex_3' }} flexWrap={{ default: 'nowrap' }}>
      <FlexItem grow={{ default: 'grow' }} />

      <FlexItem align={{ default: 'alignRight' }}>
        <ModalHOC>
          <PlanVMActionsDropdown data={vm} fieldId="actions" />
        </ModalHOC>
      </FlexItem>
    </Flex>
  );
};

export default ActionsCell;
