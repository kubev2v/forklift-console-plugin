import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const STORAGE_MAP_CORE_CONCEPTS_SUB_TOPIC_ID = 'storage-map-core-concepts';

export const storageMapCoreConceptsSubTopic: LearningExperienceSubTopic = {
  id: STORAGE_MAP_CORE_CONCEPTS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: () => [
    {
      id: `${STORAGE_MAP_CORE_CONCEPTS_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          title={t('Persistent storage')}
          content={t(
            'Persistent storage holds the migrated VM disks, ensuring data integrity and availability.',
          )}
        />
      ),
    },
    {
      id: `${STORAGE_MAP_CORE_CONCEPTS_SUB_TOPIC_ID}-b`,
      title: (
        <HelpTitledContent
          title={t('Storage classes')}
          content={t(
            'StorageClasses defines the characteristics of storage (e.g., performance, access mode, provisioner). You will map source datastores or storage domains to these OpenShift StorageClasses.',
          )}
        />
      ),
    },
  ],
  title: t('Core concepts'),
};
