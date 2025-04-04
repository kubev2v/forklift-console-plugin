import type { FC } from 'react';
import ProvidersAddButton from 'src/modules/Providers/views/list/components/ProvidersAddButton';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

type ProviderCardEmptyStateProps = {
  projectName: string;
};

export const ProviderCardEmptyState: FC<ProviderCardEmptyStateProps> = ({ projectName }) => {
  const { t } = useForkliftTranslation();

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={t('No providers found')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={SearchIcon} />}
      />
      <EmptyStateBody>
        <ForkliftTrans>
          {projectName} project does not contain any providers. To select a source provider, create
          a provider in this project or select a different project.
        </ForkliftTrans>
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <ProvidersAddButton buttonProps={{ variant: 'link' }} />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};
