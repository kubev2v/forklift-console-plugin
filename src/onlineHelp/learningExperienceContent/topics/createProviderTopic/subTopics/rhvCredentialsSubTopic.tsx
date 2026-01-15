import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const RHV_CREDENTIALS_SUB_TOPIC_ID = 'rhv-credentials';

export const rhvCredentialsSubTopic = (): LearningExperienceSubTopic => ({
  id: RHV_CREDENTIALS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${RHV_CREDENTIALS_SUB_TOPIC_ID}-a`,
      title: t(
        'Enter the username and password of the account to use to connect to the RHV Manager. This is typically an administrative or service account.',
      ),
    },
    {
      id: `${RHV_CREDENTIALS_SUB_TOPIC_ID}-b`,
      title: t(
        'Upload a custom CA certificate or check the Skip certificate validation box. We recommend uploading a CA Certificate file for secure communication.',
      ),
    },
  ],
  title: t('Fill in the fields for the Provider credentials section.'),
});
