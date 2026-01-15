import type { FC, ReactNode } from 'react';

import { Button, ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';
import { AngleDownIcon, AngleUpIcon } from '@patternfly/react-icons';

type ToggleButtonProps = {
  icon: ReactNode;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
};

const ToggleButton: FC<ToggleButtonProps> = ({ icon, isExpanded, onToggle, title }) => {
  const ExpandIcon = isExpanded ? AngleUpIcon : AngleDownIcon;

  return (
    <Button variant={ButtonVariant.link} isInline onClick={onToggle} style={{ width: '100%' }}>
      <Flex
        direction={{ default: 'row' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsCenter' }}
        spacer={{ default: 'spacerMd' }}
        flexWrap={{ default: 'nowrap' }}
      >
        <FlexItem>
          <Flex
            direction={{ default: 'row' }}
            alignItems={{ default: 'alignItemsCenter' }}
            spacer={{ default: 'spacerNone' }}
            flexWrap={{ default: 'nowrap' }}
          >
            <FlexItem>{icon}</FlexItem>
            <FlexItem>{title}</FlexItem>
          </Flex>
        </FlexItem>
        <FlexItem>
          <ExpandIcon />
        </FlexItem>
      </Flex>
    </Button>
  );
};

export default ToggleButton;
