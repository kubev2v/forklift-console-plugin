import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PageSection, Title } from '@patternfly/react-core';

import { CredentialsSection } from '../../components';

interface ProviderCredentialsProps extends RouteComponentProps {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
}

export const ProviderCredentials: React.FC<ProviderCredentialsProps> = ({
  obj,
  loaded,
  loadError,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <div>
      <PageSection>
        <Title headingLevel="h2" className="co-section-heading">
          {t('Credentials')}
        </Title>
        <CredentialsSection data={obj} loaded={loaded} loadError={loadError} />
      </PageSection>
    </div>
  );
};
