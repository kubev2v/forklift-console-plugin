import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const REVIEW_SUB_TOPIC_ID = 'migrating-review-and-create';

export const reviewSubTopic = (): LearningExperienceSubTopic => ({
  id: REVIEW_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${REVIEW_SUB_TOPIC_ID}-a`,
      title: t('Review all the configured settings for your migration plan.'),
    },
    {
      id: `${REVIEW_SUB_TOPIC_ID}-b`,
      title: t(
        `If everything looks correct, click "Create" to finalize the migration plan. This will only create the plan, not run it. The plan will be saved in the migration plan list.`,
      ),
    },
  ],
  title: t('Review and Create:'),
});
