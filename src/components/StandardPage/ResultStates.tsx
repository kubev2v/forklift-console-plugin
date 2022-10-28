import React from 'react';
import { useTranslation } from 'src/internal/i18n';

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

export const ErrorState = () => {
  const { t } = useTranslation();
  return (
    <EmptyState>
      <EmptyStateIcon icon={ExclamationCircleIcon} color="#C9190B" />
      <Title headingLevel="h4" size="lg">
        {t('Unable to retrieve data')}
      </Title>
    </EmptyState>
  );
};

export const Loading = () => {
  const { t } = useTranslation();
  return (
    <EmptyState>
      <EmptyStateIcon variant="container" component={Spinner} />
      <Title size="lg" headingLevel="h4">
        {t('Loading')}
      </Title>
    </EmptyState>
  );
};

export const NoResultsFound = () => {
  const { t } = useTranslation();
  return (
    <EmptyState>
      <EmptyStateIcon icon={SearchIcon} />
      <Title size="lg" headingLevel="h4">
        {t('No results found')}
      </Title>
    </EmptyState>
  );
};

export const NoResultsMatchFilter = ({ clearAllFilters }: { clearAllFilters: () => void }) => {
  const { t } = useTranslation();
  return (
    <EmptyState>
      <EmptyStateIcon icon={SearchIcon} />
      <Title size="lg" headingLevel="h4">
        {t('No results found')}
      </Title>
      <EmptyStateBody>
        {t('No results match the filter criteria. Clear all filters and try again.')}
      </EmptyStateBody>
      <EmptyStatePrimary>
        <Button variant="link" onClick={clearAllFilters}>
          {t('Clear all filters')}
        </Button>
      </EmptyStatePrimary>
    </EmptyState>
  );
};
