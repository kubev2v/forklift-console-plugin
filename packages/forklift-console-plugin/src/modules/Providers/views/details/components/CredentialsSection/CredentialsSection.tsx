import React from 'react';
import { ProviderData } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1Secret } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { OpenshiftCredentialsSection } from './OpenshiftCredentialsSection';
import { OpenstackCredentialsSection } from './OpenstackCredentialsSection';
import { OvirtCredentialsSection } from './OvirtCredentialsSection';
import { VSphereCredentialsSection } from './VSphereCredentialsSection';

export const CredentialsSection: React.FC<CredentialsProps> = (props) => {
  const { t } = useForkliftTranslation();
  const { data, loaded: providerLoaded, loadError: providerError } = props;
  const { provider } = data;

  const [secret, loaded, loadError] = useK8sWatchResource<V1Secret>({
    groupVersionKind: { version: 'v1', kind: 'Secret' },
    namespaced: true,
    namespace: provider?.spec?.secret?.namespace,
    name: provider?.spec?.secret?.name,
  });

  // Checking if all necessary data is available
  const isDataLoaded = secret && loaded && !loadError && providerLoaded && !providerError;
  const isProviderDataAvailable = provider?.spec?.secret?.name && provider?.spec?.secret?.namespace;
  const isSecretDataAvailable = secret?.metadata?.name && secret?.metadata?.namespace;

  // Checking if provider data matches secret data
  const doesProviderDataMatchSecret =
    secret?.metadata?.name === provider?.spec?.secret?.name &&
    secret?.metadata?.namespace === provider?.spec?.secret?.namespace;

  if (
    !isDataLoaded ||
    !isProviderDataAvailable ||
    !isSecretDataAvailable ||
    !doesProviderDataMatchSecret
  ) {
    return (
      <div>
        <span className="text-muted">{t('No secret found.')}</span>
      </div>
    );
  }

  switch (provider?.spec?.type) {
    case 'ovirt':
      return <OvirtCredentialsSection {...props} secret={secret} />;
    case 'openshift':
      return <OpenshiftCredentialsSection {...props} secret={secret} />;
    case 'openstack':
      return <OpenstackCredentialsSection {...props} secret={secret} />;
    case 'vsphere':
      return <VSphereCredentialsSection {...props} secret={secret} />;
    default:
      return <></>;
  }
};

export type CredentialsProps = {
  data: ProviderData;
  loaded: boolean;
  loadError: unknown;
};
