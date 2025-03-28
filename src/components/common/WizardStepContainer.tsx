import React, { FC, PropsWithChildren } from 'react';

import { Flex, Title } from '@patternfly/react-core';

type WizardStepContainerProps = PropsWithChildren & {
  title: string;
  isFullWidth?: boolean;
};

export const WizardStepContainer: FC<WizardStepContainerProps> = ({
  title,
  isFullWidth,
  children,
}) => (
  <Flex
    direction={{ default: 'column' }}
    spaceItems={{ default: 'spaceItemsLg' }}
    {...(!isFullWidth && { className: 'pf-v5-u-w-66' })}
  >
    <Title headingLevel="h2">{title}</Title>
    {children}
  </Flex>
);

export default WizardStepContainer;
