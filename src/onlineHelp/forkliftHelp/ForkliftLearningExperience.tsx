import type { FC } from 'react';
import { forkliftLearningExperienceTopics } from 'src/onlineHelp/forkliftHelp/topics/const';
import LearningExperiencePanel from 'src/onlineHelp/learningExperience/LearningExperiencePanel';

type Props = {
  setIsDrawerOpen: (isOpen: boolean) => void;
};

const ForkliftLearningExperience: FC<Props> = ({ setIsDrawerOpen }) => (
  <LearningExperiencePanel
    topics={forkliftLearningExperienceTopics}
    setIsDrawerOpen={setIsDrawerOpen}
  />
);

export default ForkliftLearningExperience;
