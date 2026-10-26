import type { FC, PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';

import { Flex, FlexItem, Title } from '@patternfly/react-core';

import './WizardStepContainer.style.scss';

type WizardStepContainerProps = PropsWithChildren & {
  className?: string;
  compactTitleDescription?: boolean;
  description?: ReactNode;
  isFullWidth?: boolean;
  testId?: string;
  title: ReactNode;
};

const WizardStepContainer: FC<WizardStepContainerProps> = ({
  children,
  className,
  compactTitleDescription = false,
  description,
  isFullWidth,
  testId,
  title,
}) => (
  <Flex
    className={classNames(
      isFullWidth ? 'wizard-step-container' : 'wizard-step-container--form',
      className,
    )}
    data-testid={testId}
  >
    <FlexItem
      className={
        compactTitleDescription ? 'wizard-step-container__title-group--compact' : undefined
      }
    >
      <Title headingLevel="h2">{title}</Title>
      {description}
    </FlexItem>
    <FlexItem>{children}</FlexItem>
  </Flex>
);

export default WizardStepContainer;
