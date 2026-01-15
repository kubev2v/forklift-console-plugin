import type { FC } from 'react';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';

import { PageSection, PageSectionTypes, Split, SplitItem, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreateStorageMapForm from './CreateStorageMapForm';

const StorageMapCreatePage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <LearningExperienceDrawer>
      <PageSection hasBodyWrapper={false}>
        <Split>
          <SplitItem isFilled>
            <Title headingLevel="h2">{t('Create storage map')}</Title>
          </SplitItem>
          <SplitItem>
            <LearningExperienceButton />
          </SplitItem>
        </Split>
      </PageSection>

      <PageSection
        hasBodyWrapper={false}
        hasOverflowScroll
        type={PageSectionTypes.default}
        className="pf-v6-u-flex-grow-1"
      >
        <CreateStorageMapForm />
      </PageSection>
    </LearningExperienceDrawer>
  );
};

export default StorageMapCreatePage;
