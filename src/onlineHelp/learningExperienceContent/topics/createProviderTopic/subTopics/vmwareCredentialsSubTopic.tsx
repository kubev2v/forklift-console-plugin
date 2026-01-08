import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const VMWARE_CREDENTIALS_SUB_TOPIC_ID = 'vmware-credentials';

export const vmwareCredentialsSubTopic = (): LearningExperienceSubTopic => ({
  id: VMWARE_CREDENTIALS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${VMWARE_CREDENTIALS_SUB_TOPIC_ID}-a`,
      title: t('Enter your vCenter username and password.'),
    },
    {
      id: `${VMWARE_CREDENTIALS_SUB_TOPIC_ID}-b`,
      title: t(
        'Upload a custom CA certificate or check the Skip certificate validation box. We recommend uploading a CA Certificate file for secure communication.',
      ),
    },
  ],
  title: t('Fill in the fields for the Provider credentials section:'),
});
