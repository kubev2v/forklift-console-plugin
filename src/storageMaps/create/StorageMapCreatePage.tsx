import type { FC } from 'react';

import { PageSection, PageSectionTypes, PageSectionVariants, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreateStorageMapForm from './CreateStorageMapForm';

const StorageMapCreatePage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h2">{t('Create storage map')}</Title>
      </PageSection>

      <PageSection
        hasOverflowScroll
        variant={PageSectionVariants.light}
        type={PageSectionTypes.default}
      >
        <CreateStorageMapForm />
      </PageSection>
    </>
  );
};

export default StorageMapCreatePage;
