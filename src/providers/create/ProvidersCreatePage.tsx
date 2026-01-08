import type { FC } from 'react';
import LearningExperienceButton from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceButton';
import LearningExperienceDrawer from 'src/onlineHelp/learningExperienceDrawer/LearningExperienceDrawer';

import {
  PageSection,
  PageSectionTypes,
  Split,
  SplitItem,
  Stack,
  Title,
} from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import CreateProviderForm from './CreateProviderForm';

const ProvidersCreateFormPage: FC = () => {
  const { t } = useForkliftTranslation();

  return (
    <LearningExperienceDrawer>
      <PageSection hasBodyWrapper={false}>
        <Stack hasGutter>
          <Split>
            <SplitItem isFilled>
              <Title headingLevel="h1" size="2xl">
                {t('Create provider')}
              </Title>
            </SplitItem>
            <SplitItem>
              <LearningExperienceButton />
            </SplitItem>
          </Split>

          <p className="pf-v6-u-text-color-subtle">
            {t(
              'Define the connection attributes the migration toolkit for virtualization needs to interact with your source and target providers.',
            )}
          </p>
        </Stack>
      </PageSection>

      <PageSection
        hasBodyWrapper={false}
        hasOverflowScroll
        type={PageSectionTypes.default}
        className="pf-v6-u-flex-grow-1"
      >
        <CreateProviderForm />
      </PageSection>
    </LearningExperienceDrawer>
  );
};

export default ProvidersCreateFormPage;
