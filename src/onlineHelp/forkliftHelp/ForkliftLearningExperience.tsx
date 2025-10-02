import type { FC } from 'react';
import { forkliftLearningExperienceTopics } from 'src/onlineHelp/forkliftHelp/topics/const';
import LearningExperiencePanel from 'src/onlineHelp/learningExperience/LearningExperiencePanel';

type ForkliftLearningExperienceProps = {
  setIsDrawerOpen: (isOpen: boolean) => void;
};

const ForkliftLearningExperience: FC<ForkliftLearningExperienceProps> = ({ setIsDrawerOpen }) => (
  <LearningExperiencePanel
    topics={forkliftLearningExperienceTopics}
    setIsDrawerOpen={setIsDrawerOpen}
  />
);

export default ForkliftLearningExperience;
