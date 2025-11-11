import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperience/types';

import { forkliftLearningExperienceTopics } from '../topics/const';

export const topicToIndex = (topic: LearningExperienceTopic | undefined): number | undefined => {
  const index = forkliftLearningExperienceTopics?.findIndex(
    (learningTopic: LearningExperienceTopic) => learningTopic?.id === topic?.id,
  );
  return index < 0 ? undefined : index;
};

export const indexToTopic = (index: number | undefined): LearningExperienceTopic | undefined => {
  return index === undefined ? undefined : forkliftLearningExperienceTopics[index.valueOf()];
};
