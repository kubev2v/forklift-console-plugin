import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { t } from '@utils/i18n';

import { additionalSettingsHelpTopic } from '../commonHelp/additionalSettingsHelpTopic';
import { createPlanHelpTopic } from '../commonHelp/createPlanHelpTopic';
import { goToPlansHelpTopicSection } from '../commonHelp/goToPlansHelpTopicSection';
import { planDetailsHelpTopic } from '../commonHelp/planDetailsHelpTopic';
import { reviewHelpTopic } from '../commonHelp/reviewHelpTopic';
import { selectMigrationTypeHelpTopic } from '../commonHelp/selectMigrationTypeHelpTopic';
import { selectNetworkMapHelpTopic } from '../commonHelp/selectNetworkMapHelpTopic';
import { selectStorageMapHelpTopic } from '../commonHelp/selectStorageMapHelpTopic';
import { selectVMsHelpTopic } from '../commonHelp/selectVMsHelpTopic';

import { selectVMWareMigrationTypeHelpTopic } from './selectVMWareMigrationTypeHelpTopic';

export const vmWareMigrationHelpTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'migration-steps',
    subListStyleType: ListStyleType.DECIMAL,
    subTopics: () => [
      goToPlansHelpTopicSection(),
      createPlanHelpTopic(),
      planDetailsHelpTopic(t('Choose your VMware provider.')),
      selectVMsHelpTopic(),
      selectNetworkMapHelpTopic(),
      selectStorageMapHelpTopic(),
      selectMigrationTypeHelpTopic(),
      selectVMWareMigrationTypeHelpTopic(),
      additionalSettingsHelpTopic(),
      reviewHelpTopic(),
    ],
  },
];
