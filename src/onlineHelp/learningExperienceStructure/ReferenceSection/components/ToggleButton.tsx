import type { FC, ReactNode } from 'react';

import { Button, ButtonVariant, Flex, FlexItem } from '@patternfly/react-core';
import { AngleDownIcon, AngleUpIcon } from '@patternfly/react-icons';

type ToggleButtonProps = {
  icon: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  title: string;
};

const ToggleButton: FC<ToggleButtonProps> = ({ icon, isExpanded, onToggle, title }) => {
  const ExpandIcon = isExpanded ? AngleUpIcon : AngleDownIcon;

  return (
    <Button isInline onClick={onToggle} style={{ width: '100%' }} variant={ButtonVariant.link}>
      <Flex
        alignItems={{ default: 'alignItemsCenter' }}
        direction={{ default: 'row' }}
        flexWrap={{ default: 'nowrap' }}
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        spacer={{ default: 'spacerMd' }}
      >
        <FlexItem>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            direction={{ default: 'row' }}
            flexWrap={{ default: 'nowrap' }}
            spacer={{ default: 'spacerNone' }}
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
