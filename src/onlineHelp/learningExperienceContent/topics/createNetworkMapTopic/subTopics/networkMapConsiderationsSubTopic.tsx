import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const NETWORK_MAP_CONSIDERATIONS_SUB_TOPIC_ID = 'network-map-considerations';

export const networkMapConsiderationsSubTopic: LearningExperienceSubTopic = {
  id: NETWORK_MAP_CONSIDERATIONS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: () => [
    {
      id: `${NETWORK_MAP_CONSIDERATIONS_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          title={t('IP address preservation')}
          content={t(
            "While MTV preserves MAC addresses, the original IP addresses might not be directly carried over if you're using OpenShift's Software-Defined Network (SDN), which might operate on a different VLAN. If preserving the original IP is critical, you might need to use specific network configurations or tools outside of the default OpenShift SDN.",
          )}
        />
      ),
    },
    {
      id: `${NETWORK_MAP_CONSIDERATIONS_SUB_TOPIC_ID}-b`,
      title: (
        <HelpTitledContent
          title={t('Multiple networks')}
          content={t(
            'If a source VM uses multiple network interfaces connected to different networks, you must ensure that each of these source networks is mapped to an appropriate target network (NAD) in OpenShift.',
          )}
        />
      ),
    },
  ],
  title: t('Considerations'),
};
