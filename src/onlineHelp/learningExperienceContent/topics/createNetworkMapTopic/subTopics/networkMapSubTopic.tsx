import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import { networkMapConsiderationsSubTopic } from './networkMapConsiderationsSubTopic';
import { networkMapPrerequisitesSubTopic } from './networkMapPrerequisitesSubTopic';
import { networkMapStepsSubTopic } from './networkMapStepsSubTopic';

export const networkMapSubTopics = (): LearningExperienceSubTopic => ({
  expandable: true,
  id: 'network-map-prerequisites',
  subTopics: () => [
    networkMapPrerequisitesSubTopic,
    networkMapStepsSubTopic,
    networkMapConsiderationsSubTopic,
  ],
});
