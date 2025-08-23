import type { FC } from 'react';

import { PageSection, PageSectionTypes, PageSectionVariants, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreateNetworkMapForm from './CreateNetworkMapForm';

const NetworkMapCreatePage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h2">{t('Create network map')}</Title>
      </PageSection>

      <PageSection
        hasOverflowScroll
        variant={PageSectionVariants.light}
        type={PageSectionTypes.default}
      >
        <CreateNetworkMapForm />
      </PageSection>
    </>
  );
};

export default NetworkMapCreatePage;
