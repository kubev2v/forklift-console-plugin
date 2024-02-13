import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PageSection, Title } from '@patternfly/react-core';

import { Suspend } from '../../components';
import { PlanDetailsTabProps } from '../../PlanDetailsPage';

export const PlanDetails: React.FC<PlanDetailsTabProps> = ({ plan, loaded, loadError }) => {
  const { t } = useForkliftTranslation();

  return (
    <Suspend obj={plan} loaded={loaded} loadError={loadError}>
      <PageSection variant="light" className="forklift-page-section--info">
        <Title headingLevel={'h1'}>{t('Details')}</Title>
      </PageSection>
    </Suspend>
  );
};
