import type { FC } from 'react';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import CredentialsSectionEditViewModes from './CredentialsSectionEditViewModes';

type CredentialsSectionProps = {
  provider: V1beta1Provider;
};

const CredentialsSection: FC<CredentialsSectionProps> = ({ provider }) => {
  const { t } = useForkliftTranslation();

  const secretName = provider?.spec?.secret?.name;
  const secretNamespace = provider?.spec?.secret?.namespace;

  const [secret, secretLoaded, secretLoadError] = useK8sWatchResource<IoK8sApiCoreV1Secret>({
    groupVersionKind: { kind: 'Secret', version: 'v1' },
    name: secretName,
    namespace: secretNamespace,
    namespaced: true,
  });

  if (!provider) return <span className="text-muted">{t('No provider data available.')}</span>;

  if (!secretName || !secretNamespace) {
    return (
      <div>
        <span className="text-muted">{t('No secret found.')}</span>
      </div>
    );
  }

  if (!secretLoaded && !secretLoadError) {
    return (
      <div>
        <span className="text-muted">{t('Secret is loading, please wait.')}</span>
      </div>
    );
  }

  if (secretLoadError) {
    return (
      <div>
        <span className="text-muted">
          {t('The Secret was not loaded. Try reloading the page or check if the secret exists.')}
        </span>
      </div>
    );
  }

  const isProviderMatchSecret =
    getName(secret) === secretName && getNamespace(secret) === secretNamespace;

  if (!isProviderMatchSecret) {
    return (
      <div>
        <span className="text-muted">{t('No secret found based on provider data.')}</span>
      </div>
    );
  }
  return <CredentialsSectionEditViewModes provider={provider} secret={secret} />;
};

export default CredentialsSection;
