import type { FC } from 'react';
import TipsAndTricksDrawer from 'src/onlineHelp/tipsAndTricksDrawer/TipsAndTricksDrawer';

import { PageSection, PageSectionTypes, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreateStorageMapForm from './CreateStorageMapForm';

const StorageMapCreatePage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <TipsAndTricksDrawer>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h2">{t('Create storage map')}</Title>
      </PageSection>

      <PageSection
        hasBodyWrapper={false}
        hasOverflowScroll
        type={PageSectionTypes.default}
        className="pf-v6-u-flex-grow-1"
      >
        <CreateStorageMapForm />
      </PageSection>
    </TipsAndTricksDrawer>
  );
};

export default StorageMapCreatePage;
