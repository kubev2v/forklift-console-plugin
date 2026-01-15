import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const OPENSTACK_AUTH_SUB_TOPIC_ID = 'openstack-auth';

export const openstackAuthSubTopic = (): LearningExperienceSubTopic => ({
  id: OPENSTACK_AUTH_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${OPENSTACK_AUTH_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          title={t('Password:')}
          content={t(
            'Enter the username, password, Region where your source VMs reside, project that the migration will take place (for example, migration-project), and OpenStack domain name (for example, Default).',
          )}
        />
      ),
    },
    {
      id: `${OPENSTACK_AUTH_SUB_TOPIC_ID}-b`,
      title: (
        <HelpTitledContent
          title={t('Token with user ID:')}
          content={t('Enter the authentication token and the user ID.')}
        />
      ),
    },
    {
      id: `${OPENSTACK_AUTH_SUB_TOPIC_ID}-c`,
      title: (
        <HelpTitledContent
          title={t('Token with username:')}
          content={t('Enter the authentication token and the username.')}
        />
      ),
    },
    {
      id: `${OPENSTACK_AUTH_SUB_TOPIC_ID}-d`,
      title: (
        <HelpTitledContent
          title={t('Application credential ID:')}
          content={t('Enter the application credential ID and the secret.')}
        />
      ),
    },
    {
      id: `${OPENSTACK_AUTH_SUB_TOPIC_ID}-e`,
      title: (
        <HelpTitledContent
          title={t('Application credential name:')}
          content={t('Enter the application credential name and the secret.')}
        />
      ),
    },
  ],
  title: t('Select an authentication type. Password is the most common choice.'),
});
