import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const STORAGE_MAP_PREREQUISITES_SUB_TOPIC_ID = 'storage-map-prerequisites';

export const storageMapPrerequisitesSubTopic: LearningExperienceSubTopic = {
  id: STORAGE_MAP_PREREQUISITES_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: () => [
    {
      id: `${STORAGE_MAP_PREREQUISITES_SUB_TOPIC_ID}-a`,
      title: (
        <HelpTitledContent
          content={t('Ensure that both source and target providers are correctly added.')}
          title={t('Ensure providers are connected')}
        />
      ),
    },
    {
      id: `${STORAGE_MAP_PREREQUISITES_SUB_TOPIC_ID}-b`,
      title: (
        <HelpTitledContent
          content={t('Make sure your local and shared persistent storage support VM migration.')}
          title={t('Storage support')}
        />
      ),
    },
  ],
  title: t('Prerequisites'),
};
