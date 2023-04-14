import React from 'react';

import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStatePrimary,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, SearchIcon } from '@patternfly/react-icons';

export const ErrorState = ({ title }: { title: string }) => {
  return (
    <EmptyState>
      <EmptyStateIcon icon={ExclamationCircleIcon} color="#C9190B" />
      <Title headingLevel="h4" size="lg">
        {title}
      </Title>
    </EmptyState>
  );
};

export const Loading = ({ title }: { title: string }) => {
  return (
    <EmptyState>
      <EmptyStateIcon variant="container" component={Spinner} />
      <Title size="lg" headingLevel="h4">
        {title}
      </Title>
    </EmptyState>
  );
};

export const NoResultsFound = ({ title }: { title: string }) => {
  return (
    <EmptyState>
      <EmptyStateIcon icon={SearchIcon} />
      <Title size="lg" headingLevel="h4">
        {title}
      </Title>
    </EmptyState>
  );
};

export const NoResultsMatchFilter = ({
  clearAllFilters,
  title = 'No results found',
  description = 'No results match the filter criteria. Clear all filters and try again.',
  clearAllLabel = 'Clear all filters',
}: {
  clearAllFilters: () => void;
  title?: string;
  description?: string;
  clearAllLabel?: string;
}) => {
  return (
    <EmptyState>
      <EmptyStateIcon icon={SearchIcon} />
      <Title size="lg" headingLevel="h4">
        {title}
      </Title>
      <EmptyStateBody>{description}</EmptyStateBody>
      <EmptyStatePrimary>
        <Button variant="link" onClick={clearAllFilters}>
          {clearAllLabel}
        </Button>
      </EmptyStatePrimary>
    </EmptyState>
  );
};
