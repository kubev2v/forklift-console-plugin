import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/utils/types';

import { ExternalLink } from '@components/common/ExternalLink/ExternalLink';
import { NetworkIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants';
import { t } from '@utils/i18n';

import { networkMapSubTopics } from './subTopics/networkMapSubTopic';

const NETWORK_MAP_VIDEO_URL = 'https://www.youtube.com/watch?v=LWQazV4eVTo';

const createNetworkMapSubTopics = (): LearningExperienceSubTopic[] => [
  {
    id: 'network-map-video-link',
    title: (
      <div className="forklift--learning__help-description">
        <ExternalLink href={NETWORK_MAP_VIDEO_URL} isInline>
          {t('Watch a demonstration of creating a network mapping')}
        </ExternalLink>
        {t(
          'Network mapping ensures a seamless VM connectivity after migration by defining the correspondence between source network configurations (e.g., VLANs, subnets) on an existing virtualization platform and target network configurations in the new OpenShift Virtualization environment. Without proper network mapping, migrated VMs might lose network connectivity, leading to downtime and operational issues.',
        )}
      </div>
    ),
  },
  networkMapSubTopics(),
];

export const createNetworkMapTopic: LearningExperienceTopic = {
  description: t('Define how virtual networks connect in the target environment during migration.'),
  icon: NetworkIcon,
  id: 'creating-network-mapping',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: createNetworkMapSubTopics,
  title: t('Creating a network mapping'),
  trackingEventTopic: TipsTopic.CreateNetworkMap,
};
