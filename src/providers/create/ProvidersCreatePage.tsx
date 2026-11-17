import type { FC } from 'react';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';

import { PageSection, PageSectionTypes, Split, SplitItem, Title } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreateProviderForm from './CreateProviderForm';

const ProvidersCreateFormPage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <LearningExperienceDrawer>
      <div className="create-provider-page">
        <PageSection hasBodyWrapper={false}>
          <Split>
            <SplitItem isFilled>
              <Title headingLevel="h2">{t('Create provider')}</Title>
            </SplitItem>
            <SplitItem>
              <LearningExperienceButton />
            </SplitItem>
          </Split>
        </PageSection>

        <PageSection hasBodyWrapper={false} type={PageSectionTypes.wizard}>
          <CreateProviderForm />
        </PageSection>
      </div>
    </LearningExperienceDrawer>
  );
};

export default ProvidersCreateFormPage;
