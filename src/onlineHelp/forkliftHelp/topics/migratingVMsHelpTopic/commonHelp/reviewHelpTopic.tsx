import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { t } from '@utils/i18n';

export const reviewHelpTopic = (): LearningExperienceSubTopic => ({
  id: 'migrating-review-and-create',
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: 'migrating-review-and-create-a',
      title: t('Review all the configured settings for your migration plan.'),
    },
    {
      id: 'migrating-review-and-create-b',
      title: t(
        `If everything looks correct, click "Create" to finalize the migration plan. This will only create the plan, not run it. The plan will be saved in the migration plan list.`,
      ),
    },
  ],
  title: t('Review and Create:'),
});
