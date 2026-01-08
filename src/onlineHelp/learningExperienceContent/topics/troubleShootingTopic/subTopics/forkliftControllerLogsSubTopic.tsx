import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

export const forkliftControllerLogsSubTopic = (): LearningExperienceSubTopic => ({
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
