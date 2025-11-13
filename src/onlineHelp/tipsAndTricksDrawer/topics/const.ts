import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperience/types';
import { keyTerminologyHelpTopic } from 'src/onlineHelp/tipsAndTricksDrawer/topics/KeyTerminologyHelpTopic';
import { migratingYourVmHelpTopic } from 'src/onlineHelp/tipsAndTricksDrawer/topics/MigratingVMHelpTopic';
import { migrationTypesHelpTopic } from 'src/onlineHelp/tipsAndTricksDrawer/topics/MigrationTypesHelpTopic';
import { troubleShootingHelpTopic } from 'src/onlineHelp/tipsAndTricksDrawer/topics/TroubleShootingHelpTopic';

export const forkliftLearningExperienceTopics: LearningExperienceTopic[] = [
  migratingYourVmHelpTopic,
  migrationTypesHelpTopic,
  troubleShootingHelpTopic,
  keyTerminologyHelpTopic,
];
