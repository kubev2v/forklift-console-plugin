import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { additionalSettingsSubTopic } from './additionalSettingsSubTopic';
import { createPlanSubTopic } from './createPlanSubTopic';
import { goToPlanSubTopic } from './goToPlanSubTopic';
import { planDetailsSubTopic } from './planDetailsSubTopic';
import { reviewSubTopic } from './reviewSubTopic';
import { selectMigrationTypeSubTopic } from './selectMigrationTypeSubTopic';
import { selectNetworkMapSubTopic } from './selectNetworkMapSubTopic';
import { selectStorageMapSubTopic } from './selectStorageMapSubTopic';
import { selectVMsSubTopic } from './selectVMsSubTopic';

export const commonMigratingVMsSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'migration-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToPlanSubTopic(),
      createPlanSubTopic(),
      planDetailsSubTopic(),
      selectVMsSubTopic(),
      selectNetworkMapSubTopic(),
      selectStorageMapSubTopic(),
      selectMigrationTypeSubTopic(),
      additionalSettingsSubTopic(),
      reviewSubTopic(),
    ],
  },
];
