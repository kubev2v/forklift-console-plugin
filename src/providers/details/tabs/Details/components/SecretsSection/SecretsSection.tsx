import type { FC } from 'react';
import { ModalHOC } from 'src/modules/Providers/modals/ModalHOC/ModalHOC';
import type { ProviderData } from 'src/modules/Providers/utils/types/ProviderData';

import SectionHeading from '@components/headers/SectionHeading';
import { DescriptionList, PageSection, PageSectionVariants } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { SecretDetailsItem } from './SecretDetailsItem';

type SecretsSectionProps = {
  data: ProviderData;
};

const SecretsSection: FC<SecretsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { provider } = data;

  return (
    <ModalHOC>
      <PageSection variant={PageSectionVariants.light} className="forklift-page-section">
        <SectionHeading text={t('Secrets')} />
        <DescriptionList>
          <SecretDetailsItem resource={provider} />
        </DescriptionList>
      </PageSection>
    </ModalHOC>
  );
};

export default SecretsSection;
