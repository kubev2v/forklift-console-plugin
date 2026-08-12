import type { FC } from 'react';

import SectionHeading from '@components/headers/SectionHeading';
import { DescriptionList, PageSection } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import type { ProviderData } from '@utils/providers/types';

import { SecretDetailsItem } from './SecretDetailsItem';

type SecretsSectionProps = {
  data: ProviderData;
};

const SecretsSection: FC<SecretsSectionProps> = ({ data }) => {
  const { t } = useForkliftTranslation();
  const { provider } = data;

  return (
    <PageSection className="forklift-page-section" hasBodyWrapper={false}>
      <SectionHeading text={t('Secrets')} />
      <DescriptionList>
        <SecretDetailsItem resource={provider} />
      </DescriptionList>
    </PageSection>
  );
};

export default SecretsSection;
