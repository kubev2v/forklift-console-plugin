import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { t } from '@utils/i18n';

export const selectNetworkMapSubTopic = (): LearningExperienceSubTopic => ({
  id: 'migrating-network-map',
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: 'migrating-network-map-a',
      title: t(
        `A network map is a configuration that defines how the networks from your source platform (VMware vSphere, Red Hat Virtualization, OpenStack, or OVA files) will connect to the networks in OpenShift Virtualization. You can use an existing network map, or create a new one.`,
      ),
    },
  ],
  title: t('Select a network map:'),
});
