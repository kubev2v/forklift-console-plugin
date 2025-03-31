import React from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import type { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModelGroupVersionKind, type V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { PageSection } from '@patternfly/react-core';

import { CredentialsSection } from '../../components';

type ProviderCredentialsProps = {
  obj: ProviderData;
  ns?: string;
  name?: string;
  loaded?: boolean;
  loadError?: unknown;
};

export const ProviderCredentials: React.FC<ProviderCredentialsProps> = ({
  loaded,
  loadError,
  obj,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <div>
      <PageSection variant="light">
        <SectionHeading text={t('Credentials')} />
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
    name,
    namespace,
    namespaced: true,
  });

  const data = { provider };

  return <ProviderCredentials obj={data} loaded={providerLoaded} loadError={providerLoadError} />;
};
