import type { FC } from 'react';
import LearningExperiencePanel from 'src/onlineHelp/learningExperience/LearningExperiencePanel';
import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperience/types';
import { forkliftLearningExperienceTopics } from 'src/onlineHelp/tipsAndTricksDrawer/topics/const';

type ForkliftLearningExperienceProps = {
  setIsDrawerOpen: (isOpen: boolean) => void;
  setSelectedTopic: (selectedTopic?: LearningExperienceTopic) => void;
  selectedTopic: LearningExperienceTopic | undefined;
};

const ForkliftLearningExperience: FC<ForkliftLearningExperienceProps> = ({
  selectedTopic,
  setIsDrawerOpen,
  setSelectedTopic,
}) => {
  return (
    <LearningExperiencePanel
      topics={forkliftLearningExperienceTopics}
      setIsDrawerOpen={setIsDrawerOpen}
      selectedTopic={selectedTopic}
      setSelectedTopic={setSelectedTopic}
    />
  );
};

export default ForkliftLearningExperience;
