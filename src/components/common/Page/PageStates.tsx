import type { ComponentType } from 'react';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Spinner,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, SearchIcon } from '@patternfly/react-icons';

/**
 * The page basic states.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Page/PageStates.tsx)
 */
const BaseState = ({ icon, title }: { title?: string; icon?: ComponentType<any> }) => {
  return <EmptyState titleText={title} icon={icon} headingLevel="h4"></EmptyState>;
};

export const ErrorState = ({ title }: { title: string }) => (
  <BaseState icon={ExclamationCircleIcon} title={title} />
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
    <EmptyState titleText={title} icon={SearchIcon} headingLevel="h4">
      <EmptyStateBody>{description}</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant={ButtonVariant.link} onClick={clearAllFilters}>
            {clearAllLabel}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
