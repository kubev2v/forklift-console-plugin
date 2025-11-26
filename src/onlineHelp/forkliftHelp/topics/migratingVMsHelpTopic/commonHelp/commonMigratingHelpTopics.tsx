import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { additionalSettingsHelpTopic } from './additionalSettingsHelpTopic';
import { createPlanHelpTopic } from './createPlanHelpTopic';
import { goToPlansHelpTopicSection } from './goToPlansHelpTopicSection';
import { planDetailsHelpTopic } from './planDetailsHelpTopic';
import { reviewHelpTopic } from './reviewHelpTopic';
import { selectMigrationTypeHelpTopic } from './selectMigrationTypeHelpTopic';
import { selectNetworkMapHelpTopic } from './selectNetworkMapHelpTopic';
import { selectStorageMapHelpTopic } from './selectStorageMapHelpTopic';
import { selectVMsHelpTopic } from './selectVMsHelpTopic';

export const commonMigrationHelpTopics = (
  sourceProviderText: string,
): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'migration-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToPlansHelpTopicSection(),
      createPlanHelpTopic(),
      planDetailsHelpTopic(sourceProviderText),
      selectVMsHelpTopic(),
      selectNetworkMapHelpTopic(),
      selectStorageMapHelpTopic(),
      selectMigrationTypeHelpTopic(),
      additionalSettingsHelpTopic(),
      reviewHelpTopic(),
    ],
  },
];
