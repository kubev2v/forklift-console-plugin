import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { t } from '@utils/i18n';

export const forkliftControllerLogsHelpTopic = (): LearningExperienceSubTopic => ({
  id: 'forklift-controller-logs',
  subListStyleType: ListStyleType.DISC,
  subTopics: () => [
    {
      id: 'forklift-controller-logs-details',
      title: t(
        'If the migration progress and pod logs aren’t helpful, take a look at the forklift controller logs.',
      ),
    },
    {
      id: 'forklift-controller-logs-capture',
      title: t(
        'Forklift controller logs capture Migration Toolkit for Virtualization (MTV) related events.',
      ),
    },
  ],
  title: t('Forklift controller logs'),
});
