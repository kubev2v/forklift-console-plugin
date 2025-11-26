import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperience/types';

import { migratingYourVmHelpTopic } from './migratingVMsHelpTopic/MigratingVMHelpTopic';
import { troubleShootingHelpTopic } from './troubleshootingHelpTopic/TroubleShootingHelpTopic';
import { keyTerminologyHelpTopic } from './KeyTerminologyHelpTopic';
import { migrationTypesHelpTopic } from './MigrationTypesHelpTopic';

export const forkliftLearningExperienceTopics = (): LearningExperienceTopic[] => [
  migratingYourVmHelpTopic(),
  migrationTypesHelpTopic,
  troubleShootingHelpTopic,
  keyTerminologyHelpTopic,
];
