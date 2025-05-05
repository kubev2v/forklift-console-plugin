import type { FC, MouseEvent, PropsWithChildren } from 'react';

import { HelpIconPopover } from '@components/common/HelpIconPopover/HelpIconPopover';
import { Flex, FlexItem } from '@patternfly/react-core';

type HelpIconWithLabelProps = PropsWithChildren & {
  label: string;
};

const HelpIconWithLabel: FC<HelpIconWithLabelProps> = ({ children, label }) => {
  return (
    <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsNone' }}>
      <FlexItem>{label}</FlexItem>

      <HelpIconPopover
        header={label}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
        }}
      >
        {children}
      </HelpIconPopover>
    </Flex>
  );
};

export default HelpIconWithLabel;
