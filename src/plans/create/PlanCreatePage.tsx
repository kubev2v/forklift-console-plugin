import type { FC } from 'react';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';

import { PageSection, PageSectionTypes, Split, SplitItem, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreatePlanWizard from './CreatePlanWizard';

const PlanCreatePage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <LearningExperienceDrawer>
      <div className="plan-create-page">
        <PageSection hasBodyWrapper={false}>
          <Split>
            <SplitItem isFilled>
              <Title headingLevel="h2">{t('Create migration plan')}</Title>
            </SplitItem>
            <SplitItem>
              <LearningExperienceButton />
            </SplitItem>
          </Split>
        </PageSection>

        <PageSection hasBodyWrapper={false} type={PageSectionTypes.wizard}>
          <CreatePlanWizard />
        </PageSection>
      </div>
    </LearningExperienceDrawer>
  );
};

export default PlanCreatePage;
