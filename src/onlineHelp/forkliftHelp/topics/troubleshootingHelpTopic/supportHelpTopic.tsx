import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { ForkliftTrans, t } from '@utils/i18n';

const supportUrl = 'https://access.redhat.com/support/';

export const supportHelpTopic = (): LearningExperienceSubTopic => ({
  id: 'troubleshooting-support',
  subListStyleType: ListStyleType.DISC,
  subTopics: () => [
    {
      id: 'troubleshooting-support-link',
      title: (
        <ForkliftTrans>
          If none of these steps helped, you can reach out to{' '}
          <ExternalLink href={supportUrl} isInline>
            support
          </ExternalLink>{' '}
          to get answers any time.
        </ForkliftTrans>
      ),
    },
  ],
  title: t('Support'),
});
