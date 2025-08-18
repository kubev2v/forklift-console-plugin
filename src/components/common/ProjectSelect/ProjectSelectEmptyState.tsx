import type { FC, ReactNode } from 'react';

import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
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
    return undefined;
  }

  return (
    <EmptyState>
      <EmptyStateHeader headingLevel="h6" icon={<EmptyStateIcon icon={PlusCircleIcon} />} />
      <EmptyStateBody>{emptyStateMessage}</EmptyStateBody>
      {onCreate ? (
        <EmptyStateFooter>
          <EmptyStateActions>
            <Button variant={ButtonVariant.link} onClick={onCreate}>
              {t('Create project')}
            </Button>
          </EmptyStateActions>
        </EmptyStateFooter>
      ) : null}
    </EmptyState>
  );
};

export default ProjectSelectEmptyState;
