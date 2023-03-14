import React from 'react';

import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  TextContent,
  Title,
} from '@patternfly/react-core';

export type EmptyStateProps = {
  icon: React.ComponentType;
  title: React.ReactNode;
  textContent: React.ReactNode;
  callForActionButtons?: React.ReactNode;
};

export const ForkliftEmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  textContent,
  callForActionButtons,
}) => {
  return (
    <EmptyState variant={EmptyStateVariant.large} isFullHeight>
      <EmptyStateIcon icon={icon} />

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
