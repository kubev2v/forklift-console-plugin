import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
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

export const ProviderCredentialsWrapper: React.FC<{ name: string; namespace: string }> = ({
  name,
  namespace,
}) => {
  const [provider, providerLoaded, providerLoadError] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });

  const data = { provider };

  return <ProviderCredentials obj={data} loaded={providerLoaded} loadError={providerLoadError} />;
};
