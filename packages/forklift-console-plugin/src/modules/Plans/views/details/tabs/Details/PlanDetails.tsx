import React from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PageSection } from '@patternfly/react-core';

import { ConditionsSection, DetailsSection, ProvidersSection, Suspend } from '../../components';
import { PlanDetailsTabProps } from '../../PlanDetailsPage';

export const PlanDetails: React.FC<PlanDetailsTabProps> = ({ plan, loaded, loadError }) => {
  const { t } = useForkliftTranslation();

  return (
    <Suspend obj={plan} loaded={loaded} loadError={loadError}>
      <PageSection variant="light" className="forklift-page-section--details">
        <SectionHeading text={t('Plan details')} />
        <DetailsSection obj={plan} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Providers')} />
        <ProvidersSection obj={plan} />
      </PageSection>

      <PageSection variant="light" className="forklift-page-section">
        <SectionHeading text={t('Conditions')} />
        <ConditionsSection conditions={plan?.status?.conditions} />
      </PageSection>
    </Suspend>
  );
};
