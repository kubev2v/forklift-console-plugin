import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PageSection, Title } from '@patternfly/react-core';

import { PlanDetailsTabProps } from '../../PlanDetailsPage';

export const PlanDetails: React.FC<PlanDetailsTabProps> = ({ plan, loaded, loadError }) => {
  const { t } = useForkliftTranslation();

  return (
    <PageSection variant="light" className="forklift-page-section--info">
      <Title headingLevel={'h1'}>{t('Details')}</Title>
    </PageSection>
  );
};
