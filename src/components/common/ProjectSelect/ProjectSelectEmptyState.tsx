import type { FC, ReactNode } from 'react';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import { useForkliftTranslation } from '@utils/i18n.tsx';

type ProjectSelectEmptyStateProps = {
  emptyStateMessage?: ReactNode;
  onCreate?: () => void;
};

const ProjectSelectEmptyState: FC<ProjectSelectEmptyStateProps> = ({
  emptyStateMessage,
  onCreate,
}) => {
  const { t } = useForkliftTranslation();

  if (!emptyStateMessage) {
    return null;
  }

  return (
    <EmptyState headingLevel="h6" icon={PlusCircleIcon}>
      <EmptyStateBody>{emptyStateMessage}</EmptyStateBody>
      {onCreate ? (
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button
              variant={ButtonVariant.link}
              onClick={onCreate}
              data-testid="create-project-button"
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
