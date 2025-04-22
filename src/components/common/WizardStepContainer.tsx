import type { FC, PropsWithChildren, ReactNode } from 'react';

import { Flex, FlexItem, Title } from '@patternfly/react-core';

import './WizardStepContainer.style.scss';

type WizardStepContainerProps = PropsWithChildren & {
  title: ReactNode;
  description?: ReactNode;
  isFullWidth?: boolean;
};

const WizardStepContainer: FC<WizardStepContainerProps> = ({
  children,
  description,
  isFullWidth,
  title,
}) => (
  <Flex className={`wizard-step-container${isFullWidth ? '' : '--form'}`}>
    <Title headingLevel="h2">{title}</Title>
    {description && <FlexItem>{description}</FlexItem>}
    <FlexItem>{children}</FlexItem>
  </Flex>
);

export default WizardStepContainer;
