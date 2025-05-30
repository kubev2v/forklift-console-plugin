import type { FC } from 'react';
import SectionHeading from 'src/components/headers/SectionHeading';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { V1beta1Provider } from '@kubev2v/types';
import { PageSection, PageSectionVariants, Stack } from '@patternfly/react-core';

import CredentialsSection from './components/CredentialsSection';

type ProviderCredentialsTabPageProps = {
  provider: V1beta1Provider;
};

const ProviderCredentialsTabPage: FC<ProviderCredentialsTabPageProps> = ({ provider }) => {
  const { t } = useForkliftTranslation();

  return (
    <ModalHOC>
      <PageSection variant={PageSectionVariants.light}>
        <Stack hasGutter>
          <SectionHeading text={t('Credentials')} />
          <CredentialsSection provider={provider} />
        </Stack>
      </PageSection>
    </ModalHOC>
  );
};

export default ProviderCredentialsTabPage;
