import type { ComponentType, FC, ReactNode } from 'react';

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  TextContent,
  Title,
} from '@patternfly/react-core';

type EmptyStateProps = {
  icon: ComponentType;
  title: ReactNode;
  textContent: ReactNode;
  callForActionButtons?: ReactNode;
};

const ForkliftEmptyState: FC<EmptyStateProps> = ({
  callForActionButtons,
  icon,
  textContent,
  title,
}) => {
  return (
    <EmptyState variant={EmptyStateVariant.lg} isFullHeight>
      {icon && <EmptyStateIcon icon={icon} />}

      <Title headingLevel="h4" size="lg">
        {title}
      </Title>

      <EmptyStateBody style={{ textAlign: 'left' }}>
        <Bullseye>
          <TextContent>{textContent}</TextContent>
        </Bullseye>
      </EmptyStateBody>

      {callForActionButtons}
    </EmptyState>
  );
};

export default ForkliftEmptyState;
