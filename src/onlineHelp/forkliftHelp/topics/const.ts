import { keyTerminologyHelpTopic } from 'src/onlineHelp/forkliftHelp/topics/KeyTerminologyHelpTopic';
import { migratingYourVmHelpTopic } from 'src/onlineHelp/forkliftHelp/topics/MigratingVMHelpTopic';
import { migrationTypesHelpTopic } from 'src/onlineHelp/forkliftHelp/topics/MigrationTypesHelpTopic';
import { troubleShootingHelpTopic } from 'src/onlineHelp/forkliftHelp/topics/TroubleShootingHelpTopic';
import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperience/types';

export const forkliftLearningExperienceTopics: LearningExperienceTopic[] = [
  migratingYourVmHelpTopic,
  migrationTypesHelpTopic,
  troubleShootingHelpTopic,
  keyTerminologyHelpTopic,
];
