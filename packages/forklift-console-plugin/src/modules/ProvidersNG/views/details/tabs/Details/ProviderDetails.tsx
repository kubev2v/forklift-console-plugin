import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ProviderData } from 'src/modules/ProvidersNG/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PageSection, Title } from '@patternfly/react-core';

import { ConditionsSection, DetailsSection, InventorySection } from '../../components';

interface ProviderDetailsProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ProviderDetails: React.FC<ProviderDetailsProps> = ({ obj, loaded, loadError }) => {
  const { t } = useForkliftTranslation();
  const { provider } = obj;

  if (!loaded || loadError || !provider?.metadata?.name) {
    return <></>;
  }

  return (
    <div>
      <PageSection>
        <Title headingLevel="h2" className="co-section-heading">
          {t('Provider details')}
        </Title>
        <DetailsSection data={obj} />
      </PageSection>

      <PageSection className="forklift-page-section">
        <Title headingLevel="h2" className="co-section-heading">
          {t('Provider inventory')}
        </Title>
        <InventorySection data={obj} />
      </PageSection>

      <PageSection className="forklift-page-section">
        <Title headingLevel="h2" className="co-section-heading">
          {t('Conditions')}
        </Title>
        <ConditionsSection conditions={provider?.status?.conditions} />
      </PageSection>
    </div>
  );
};
