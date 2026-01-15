import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const SELECT_NETWORK_MAP_SUB_TOPIC_ID = 'migrating-network-map';

export const selectNetworkMapSubTopic = (): LearningExperienceSubTopic => ({
  id: SELECT_NETWORK_MAP_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${SELECT_NETWORK_MAP_SUB_TOPIC_ID}-a`,
      title: t(
        `A network map is a configuration that defines how the networks from your source platform (VMware vSphere, Red Hat Virtualization, OpenStack, or OVA files) will connect to the networks in OpenShift Virtualization. You can use an existing network map, or create a new one.`,
      ),
    },
  ],
  title: t('Select a network map:'),
});
