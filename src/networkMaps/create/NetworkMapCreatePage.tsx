import type { FC } from 'react';

import { PageSection, PageSectionTypes, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreateNetworkMapForm from './CreateNetworkMapForm';

const NetworkMapCreatePage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h2">{t('Create network map')}</Title>
      </PageSection>

      <PageSection
        hasBodyWrapper={false}
        hasOverflowScroll
        type={PageSectionTypes.default}
        className="pf-v6-u-flex-grow-1"
      >
        <CreateNetworkMapForm />
      </PageSection>
    </>
  );
};

export default NetworkMapCreatePage;
