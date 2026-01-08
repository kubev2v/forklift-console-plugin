import type { FC } from 'react';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';

import { PageSection, PageSectionTypes, Split, SplitItem, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreateNetworkMapForm from './CreateNetworkMapForm';

const NetworkMapCreatePage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <LearningExperienceDrawer>
      <PageSection hasBodyWrapper={false}>
        <Split>
          <SplitItem isFilled>
            <Title headingLevel="h2">{t('Create network map')}</Title>
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
        <CreateNetworkMapForm />
      </PageSection>
    </LearningExperienceDrawer>
  );
};

export default NetworkMapCreatePage;
