import type { ComponentType, ReactElement } from 'react';

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
const BaseState = ({ icon, title }: { icon?: ComponentType; title?: string }): ReactElement => {
  return <EmptyState headingLevel="h4" icon={icon} titleText={title}></EmptyState>;
};

export const ErrorState = ({ title }: { title: string }): ReactElement => (
  <BaseState icon={ExclamationCircleIcon} title={title} />
);

export const Loading = ({ title }: { title: string }): ReactElement => (
  <BaseState icon={Spinner} title={title} />
);

export const NoResultsFound = ({ title }: { title: string }): ReactElement => (
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
  clearAllLabel?: string;
  description?: string;
  title?: string;
}): ReactElement => {
  return (
    <EmptyState headingLevel="h4" icon={SearchIcon} titleText={title}>
      <EmptyStateBody>{description}</EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button onClick={clearAllFilters} variant={ButtonVariant.link}>
            {clearAllLabel}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
