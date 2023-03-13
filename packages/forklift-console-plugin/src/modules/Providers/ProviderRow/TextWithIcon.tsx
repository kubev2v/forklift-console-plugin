import React from 'react';
import Linkify from 'react-linkify';

import { Flex, FlexItem } from '@patternfly/react-core';

export type TextWithIconProps = {
  label: string;
  icon: React.ReactNode;
};

export const TextWithIcon: React.FC<TextWithIconProps> = ({ label, icon }) => {
  return (
    <Flex
      spaceItems={{ default: 'spaceItemsXs' }}
      display={{ default: 'inlineFlex' }}
      flexWrap={{ default: 'nowrap' }}
    >
      {icon ? <FlexItem>{icon}</FlexItem> : ''}
      <FlexItem>
        <Linkify>{label}</Linkify>
      </FlexItem>
    </Flex>
  );
};
