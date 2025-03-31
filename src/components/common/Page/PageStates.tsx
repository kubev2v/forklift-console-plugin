import React, { type ComponentType } from 'react';

import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  Spinner,
  Title,
} from '@patternfly/react-core';
import ExclamationCircleIcon from '@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

/**
 * The page basic states.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Page/PageStates.tsx)
 */
export const BaseState = ({
  color,
  icon,
  title,
}: {
  title?: string;
  icon?: ComponentType<unknown>;
  color?: string;
}) => {
  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={title}
        headingLevel="h4"
        icon={icon && <EmptyStateIcon icon={icon} color={color} />}
      />
    </EmptyState>
  );
};

export const ErrorState = ({ title }: { title: string }) => (
  <BaseState icon={ExclamationCircleIcon} color="#C9190B" title={title} />
);

export const Loading = ({ title }: { title: string }) => <BaseState icon={Spinner} title={title} />;

export const NoResultsFound = ({ title }: { title: string }) => (
  <BaseState icon={SearchIcon} title={title} />
);

/**
 * The page for a case of no results matching a filter, including a title, description and a button for clearing all filters.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Page/PageStates.tsx)
 */
export const NoResultsMatchFilter = ({
  clearAllFilters,
  clearAllLabel = 'Clear all filters',
  description = 'No results match the filter criteria. Clear all filters and try again.',
  title = 'No results found',
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
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="link" onClick={clearAllFilters}>
            {clearAllLabel}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
