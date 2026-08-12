import type { FC, ReactNode } from 'react';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { ExclamationTriangleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n';

type ProjectSelectEmptyStateProps = {
  emptyStateMessage?: ReactNode;
  errorLoading?: Error | null;
  onCreate?: () => void;
};

const ProjectSelectEmptyState: FC<ProjectSelectEmptyStateProps> = ({
  emptyStateMessage,
  errorLoading,
  onCreate,
}) => {
  const { t } = useForkliftTranslation();

  if (!emptyStateMessage) {
    return null;
  }

  return (
    <EmptyState headingLevel="h6" icon={errorLoading ? ExclamationTriangleIcon : PlusCircleIcon}>
      <EmptyStateBody>{emptyStateMessage}</EmptyStateBody>
      {onCreate && !errorLoading ? (
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              data-testid="create-project-button"
              onClick={onCreate}
              variant={ButtonVariant.link}
            >
              {t('Create project')}
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      ) : null}
    </EmptyState>
  );
};

export default ProjectSelectEmptyState;
