import {
  type LearningExperienceSubTopic,
  type LearningExperienceTopic,
  ListStyleType,
} from 'src/onlineHelp/utils/types';

import { DatabaseIcon } from '@patternfly/react-icons';
import { TipsTopic } from '@utils/analytics/constants';
import { t } from '@utils/i18n';

import { storageMapConsiderationsSubTopic } from './subTopics/storageMapConsiderationsSubTopic';
import { storageMapCoreConceptsSubTopic } from './subTopics/storageMapCoreConceptsSubTopic';
import { storageMapPrerequisitesSubTopic } from './subTopics/storageMapPrerequisitesSubTopic';
import { storageMapStepsSubTopic } from './subTopics/storageMapStepsSubTopic';

const createStorageMapSubTopics = (): LearningExperienceSubTopic[] => [
  {
    expandable: true,
    id: 'storage-map-prerequisites',
    subTopics: () => [
      storageMapCoreConceptsSubTopic,
      storageMapPrerequisitesSubTopic,
      storageMapStepsSubTopic,
      storageMapConsiderationsSubTopic,
    ],
  },
];

export const createStorageMapTopic: LearningExperienceTopic = {
  description: t('Set up storage to ensure smooth and efficient VM migration.'),
  icon: DatabaseIcon,
  id: 'creating-storage-mapping',
  subListStyleType: ListStyleType.DESCRIPTIONS,
  subTopics: createStorageMapSubTopics,
  title: t('Creating a storage mapping'),
  trackingEventTopic: TipsTopic.CreateStorageMap,
};
