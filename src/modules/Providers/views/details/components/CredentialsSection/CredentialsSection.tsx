import React from 'react';
import { ModalHOC } from 'src/modules/Providers/modals';
import type { ProviderData, SecretSubType } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { EsxiCredentialsSection } from './EsxiCredentialsSection';
import { OpenshiftCredentialsSection } from './OpenshiftCredentialsSection';
import { OpenstackCredentialsSection } from './OpenstackCredentialsSection';
import { OvirtCredentialsSection } from './OvirtCredentialsSection';
import { VCenterCredentialsSection } from './VCenterCredentialsSection';

export const CredentialsSection: React.FC<CredentialsProps> = (props) => {
  const { t } = useForkliftTranslation();
  const { data, loaded, loadError } = props;
  const { provider } = data;

  const type = provider?.spec?.type;
  const subTypeString = provider?.spec?.settings?.sdkEndpoint || '';
  const subType = subTypeString === 'esxi' ? 'esxi' : 'vcenter';

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
    <ModalHOC>
      <CredentialsSection_
        name={provider?.spec?.secret?.name}
        namespace={provider?.spec?.secret?.namespace}
        type={type}
        subType={subType}
      />
    </ModalHOC>
  );
};

export const CredentialsSection_: React.FC<{
  name: string;
  namespace: string;
  type: string;
  subType: SecretSubType;
}> = ({ name, namespace, subType, type }) => {
  const { t } = useForkliftTranslation();

  const [secret, loaded, loadError] = useK8sWatchResource<IoK8sApiCoreV1Secret>({
    groupVersionKind: { kind: 'Secret', version: 'v1' },
    name,
    namespace,
    namespaced: true,
  });

  // Checking if provider data matches secret data
  const doesProviderDataMatchSecret =
    secret?.metadata?.name === name && secret?.metadata?.namespace === namespace;

  if (!loaded && !loadError) {
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
          {t('The Secret was not loaded. Try reloading the page.')}
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
      if (subType === 'esxi') {
        return <EsxiCredentialsSection secret={secret} />;
      }
      return <VCenterCredentialsSection secret={secret} />;

    default:
      return <></>;
  }
};

export type CredentialsProps = {
  data: ProviderData;
  loaded: boolean;
  loadError: unknown;
};
