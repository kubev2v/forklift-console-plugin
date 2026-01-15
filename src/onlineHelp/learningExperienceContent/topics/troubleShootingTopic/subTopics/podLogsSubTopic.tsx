import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

export const podLogsSubTopic = (): LearningExperienceSubTopic => ({
  id: 'pod-logs',
  subListStyleType: ListStyleType.DISC,
  subTopics: () => [
    {
      id: 'pod-logs-details',
      title: t('Pod logs contain the details on the status of a specific pod within Kubernetes.'),
    },
    {
      id: 'pod-logs-image-conversion',
      title: t(
        'The pod logs are only available after "image conversion". If available, you can view them by expanding the “Migration Resources” section, looking under the “Pod” subheading, and clicking “View logs”.',
      ),
    },
  ],
  title: t('Pod logs'),
});
