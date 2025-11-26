import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { t } from '@utils/i18n';

export const selectStorageMapHelpTopic = (): LearningExperienceSubTopic => ({
  id: 'migrating-storage-map',
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: 'migrating-storage-map-a',
      title: t(
        `A storage map is a configuration that defines how the storage resources from your source platform (VMware vSphere, Red Hat Virtualization, OpenStack, or OVA files) will connect to the storage resources in OpenShift. Virtualization. You can use an existing storage map, or create a new one.`,
      ),
    },
  ],
  title: t('Select a storage map:'),
});
