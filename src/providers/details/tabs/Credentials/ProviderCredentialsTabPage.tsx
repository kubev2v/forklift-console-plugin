import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { useForkliftTranslation } from 'src/utils/i18n';

import { PageSection, Stack } from '@patternfly/react-core';

import { useProvider } from '../../hooks/useProvider';
import type { ProviderDetailsPageProps } from '../../utils/types';

import CredentialsSection from './components/CredentialsSection';

const ProviderCredentialsTabPage: FC<ProviderDetailsPageProps> = ({ name, namespace }) => {
  const { t } = useForkliftTranslation();
  const { provider } = useProvider(name, namespace);

  return (
    <PageSection hasBodyWrapper={false}>
      <Stack hasGutter>
        <SectionHeading text={t('Credentials')} />
        <CredentialsSection provider={provider} />
      </Stack>
    </PageSection>
  );
};

export default ProviderCredentialsTabPage;
