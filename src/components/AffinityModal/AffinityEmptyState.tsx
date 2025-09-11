import type { FC } from 'react';

import {
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateVariant,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import AddAffinityRuleButton from './AddAffinityRuleButton';
import AffinityDescriptionText from './AffinityDescriptionText';

type AffinityEmptyStateProps = {
  onAffinityClickAdd: () => void;
};

const AffinityEmptyState: FC<AffinityEmptyStateProps> = ({ onAffinityClickAdd }) => {
  const { t } = useForkliftTranslation();

  return (
    <EmptyState variant={EmptyStateVariant.full}>
      <EmptyStateHeader headingLevel="h5" titleText={<>{t('No affinity rules found')}</>} />
      <EmptyStateBody>
        <AffinityDescriptionText />
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <AddAffinityRuleButton onAffinityClickAdd={onAffinityClickAdd} />
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );
};

export default AffinityEmptyState;
