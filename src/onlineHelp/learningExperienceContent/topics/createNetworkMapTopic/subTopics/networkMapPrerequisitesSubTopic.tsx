import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const NETWORK_MAP_PREREQUISITES_SUB_TOPIC_ID = 'network-map-prerequisites';

export const networkMapPrerequisitesSubTopic: LearningExperienceSubTopic = {
  id: NETWORK_MAP_PREREQUISITES_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: () => [
    {
      id: `${NETWORK_MAP_PREREQUISITES_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          title={t('Ensure providers are connected')}
          content={t(
            'Ensure that both source and target providers are correctly added. Without the source and target providers properly connected and configured, MTV cannot see the networks on either side to map them.',
          )}
        />
      ),
    },
    {
      id: `${NETWORK_MAP_PREREQUISITES_SUB_TOPIC_ID}-b`,
      title: (
        <HelpTitledContent
          title={t('Network attachment definitions')}
          content={t(
            'If you map more than 1 source and target network, each additional OpenShift Virtualization network requires its own network attachment definition.',
          )}
        />
      ),
    },
  ],
  title: t('Prerequisites'),
};
