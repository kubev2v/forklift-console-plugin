import type { FC } from 'react';
import LearningExperiencePanel from 'src/onlineHelp/learningExperience/LearningExperiencePanel';

import ForkliftReferences from './reference/ForkliftReferences';
import { forkliftLearningExperienceTopics } from './topics/const';
import ForkliftExternalLinks from './ForkliftExternalLinks';

const ForkliftLearningExperience: FC = () => (
  <LearningExperiencePanel
    topics={forkliftLearningExperienceTopics()}
    footer={
      <>
        <ForkliftReferences />
        <ForkliftExternalLinks />
      </>
    }
  />
);

export default ForkliftLearningExperience;
