import { type FC, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import SectionHeadingWithEdit from '@components/headers/SectionHeadingWithEdit';
import LoadingSuspend from '@components/LoadingSuspend';
import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';
import {
  useAccessReview,
  useK8sWatchResource,
  useModal,
} from '@openshift-console/dynamic-plugin-sdk';
import { PageSection, Stack } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { getName, getNamespace } from '@utils/crds/common/selectors';

import { useProvider } from '../../hooks/useProvider';
import type { ProviderDetailsPageProps } from '../../utils/types';

import CredentialsSection from './components/CredentialsSection';
import EditProviderCredentials, {
  type EditProviderCredentialsProps,
} from './components/EditProviderCredentials';
const ProviderCredentialsTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const [reveal, setReveal] = useState(false);
  const launcher = useModal();

  const { loaded, loadError, provider } = useProvider(name, namespace);

  const [secret, secretLoaded, secretLoadError] = useK8sWatchResource<IoK8sApiCoreV1Secret>({
    groupVersionKind: { kind: 'Secret', version: 'v1' },
    name: provider?.spec?.secret?.name,
    namespace: provider?.spec?.secret?.namespace,
    namespaced: true,
  });

  const [canPatch] = useAccessReview({
    group: '',
    name: getName(secret),
    namespace: getNamespace(secret),
    resource: 'secrets',
    verb: 'patch',
  });

  return (
    <LoadingSuspend
      obj={provider ?? secret}
      loaded={loaded ?? secretLoaded}
      loadError={loadError ?? secretLoadError}
    >
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <SectionHeadingWithEdit
            onClick={() => {
              launcher<EditProviderCredentialsProps>(EditProviderCredentials, { provider, secret });
            }}
            additionalActions={[
              {
                children: reveal ? t('Hide values') : t('Reveal values'),
                icon: reveal ? <EyeSlashIcon /> : <EyeIcon />,
                key: 'reveal-values-button',
                onClick: () => {
                  setReveal((prev) => !prev);
                },
              },
            ]}
            editable={canPatch}
            title={t('Credentials')}
          />
          <CredentialsSection provider={provider} secret={secret} reveal={reveal} />
        </Stack>
      </PageSection>
    </LoadingSuspend>
  );
};

export default ProviderCredentialsTabPage;
