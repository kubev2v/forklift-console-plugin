import type { FC } from 'react';
import LearningExperiencePanel from 'src/onlineHelp/learningExperienceStructure/LearningExperiencePanel';

import ExternalLinksSection from './externalLinksSection/ExternalLinksSection';
import QuickReferencesSection from './quickReferencesSection/QuickReferencesSection';
import { learningExperienceTopics } from './topics/utils/constants';

const LearningExperienceContentMain: FC = () => (
  <LearningExperiencePanel
    topics={learningExperienceTopics}
    footer={
      <>
        <QuickReferencesSection />
        <ExternalLinksSection />
      </>
    }
  />
);

export default LearningExperienceContentMain;
