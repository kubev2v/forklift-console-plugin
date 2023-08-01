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
  const { data, loaded, loadError } = props;
  const { provider } = data;

  if (!provider?.spec?.secret?.name || !provider?.spec?.secret?.namespace) {
    return (
      <div>
        <span className="text-muted">{t('No secret.')}</span>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div>
        <span className="text-muted">{t('Secret is loading, please wait.')}</span>
      </div>
    );
  }

  if (loaded && loadError) {
    return (
      <div>
        <span className="text-muted">{t('Secret failed to load, check if the secret exist.')}</span>
      </div>
    );
  }

  return (
    <CredentialsSection_
      name={provider?.spec?.secret?.name}
      namespace={provider?.spec?.secret?.namespace}
      type={provider?.spec?.type}
    />
  );
};

export const CredentialsSection_: React.FC<{ name: string; namespace: string; type: string }> = ({
  name,
  namespace,
  type,
}) => {
  const { t } = useForkliftTranslation();

  const [secret, loaded, loadError] = useK8sWatchResource<V1Secret>({
    groupVersionKind: { version: 'v1', kind: 'Secret' },
    namespaced: true,
    namespace: namespace,
    name: name,
  });

  // Checking if provider data matches secret data
  const doesProviderDataMatchSecret =
    secret?.metadata?.name === name && secret?.metadata?.namespace === namespace;

  if (!loaded) {
    return (
      <div>
        <span className="text-muted">{t('Secret is loading, please wait.')}</span>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <span className="text-muted">
          {t('Something is wrong, the secret was not loaded, please try to reload the page.')}
        </span>
      </div>
    );
  }

  if (!doesProviderDataMatchSecret) {
    return (
      <div>
        <span className="text-muted">{t('No secret found.')}</span>
      </div>
    );
  }

  switch (type) {
    case 'ovirt':
      return <OvirtCredentialsSection secret={secret} />;
    case 'openshift':
      return <OpenshiftCredentialsSection secret={secret} />;
    case 'openstack':
      return <OpenstackCredentialsSection secret={secret} />;
    case 'vsphere':
      return <VSphereCredentialsSection secret={secret} />;
    default:
      return <></>;
  }
};

export type CredentialsProps = {
  data: ProviderData;
  loaded: boolean;
  loadError: unknown;
};
