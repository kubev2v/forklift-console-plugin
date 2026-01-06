import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { ForkliftTrans, t } from '@utils/i18n';

import { SUPPORT_URL } from '../../utils/constants';

export const supportSubTopic = (): LearningExperienceSubTopic => ({
  id: 'troubleshooting-support',
  subListStyleType: ListStyleType.DISC,
  subTopics: () => [
    {
      id: 'troubleshooting-support-link',
      title: (
        <ForkliftTrans>
          If none of these steps helped, you can reach out to{' '}
          <ExternalLink href={SUPPORT_URL} isInline>
            support
          </ExternalLink>{' '}
          to get answers any time.
        </ForkliftTrans>
      ),
    },
  ],
  title: t('Support'),
});
