import { type FC, useMemo, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import LoadingSuspend from '@components/LoadingSuspend';
import { type IoK8sApiCoreV1Secret, SecretModel } from '@forklift-ui/types';
import {
  getGroupVersionKindForModel,
  useAccessReview,
  useOverlay,
} from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Stack } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

import { useProvider } from '../../hooks/useProvider';
import type { ProviderDetailsPageProps } from '../../utils/types';

import CredentialsSection from './components/CredentialsSection';
import EditProviderCredentials, {
  type EditProviderCredentialsProps,
} from './components/EditProviderCredentials';
const ProviderCredentialsTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const [reveal, setReveal] = useState(false);
  const launchOverlay = useOverlay();

  const { loaded, loadError, provider } = useProvider(name, namespace);

  const [providerSecretName, providerSecretNamespace] = useMemo(
    () => [provider?.spec?.secret?.name, provider?.spec?.secret?.namespace],
    [provider?.spec?.secret],
  );

  const [secret, secretLoaded, secretLoadError] = useTypedK8sWatchResource<IoK8sApiCoreV1Secret>({
    groupVersionKind: getGroupVersionKindForModel(SecretModel),
    name: providerSecretName,
    namespace: providerSecretNamespace,
    namespaced: true,
  });

  const [canPatch] = useAccessReview({
    name: providerSecretName,
    namespace: providerSecretNamespace,
    resource: SecretModel.plural,
    verb: 'patch',
  });

  return (
    <LoadingSuspend
      loaded={loaded ?? secretLoaded}
      loadError={loadError ?? secretLoadError}
      obj={provider ?? secret}
    >
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <SectionHeadingWithEdit
            additionalActions={[
              {
                children: reveal ? t('Hide values') : t('Reveal values'),
                'data-testid': 'credentials-reveal-button',
                icon: reveal ? <EyeSlashIcon /> : <EyeIcon />,
                key: 'reveal-values-button',
                onClick: () => {
                  setReveal((prev) => !prev);
                },
              },
            ]}
            data-testid="credentials-edit-button"
            editable={canPatch}
            onClick={() => {
              launchOverlay<EditProviderCredentialsProps>(EditProviderCredentials, {
                provider,
                secret,
              });
            }}
            title={t('Credentials')}
          />
          <CredentialsSection provider={provider} reveal={reveal} secret={secret} />
        </Stack>
      </PageSection>
    </LoadingSuspend>
  );
};

export default ProviderCredentialsTabPage;
