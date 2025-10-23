import type { FC } from 'react';
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
    <PageSection variant={PageSectionVariants.light} className="forklift-page-section">
      <SectionHeading text={t('Secrets')} />
      <DescriptionList>
        <SecretDetailsItem resource={provider} />
      </DescriptionList>
    </PageSection>
  );
};

export default SecretsSection;
