import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { StorageMapModelGroupVersionKind } from '@kubev2v/types';
import { t } from '@utils/i18n';

import LabelButton from '../../components/LabelButton';

const STORAGE_MAP_STEPS_SUB_TOPIC_ID = 'storage-map-steps';

export const storageMapStepsSubTopic: LearningExperienceSubTopic = {
  expandable: true,
  id: STORAGE_MAP_STEPS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.DECIMAL,
  subTopics: () => [
    {
      id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-1`,
      title: (
        <LabelButton
          groupVersionKind={StorageMapModelGroupVersionKind}
          label={t('Storage maps')}
          preText={t('Go to')}
        />
      ),
    },
    {
      id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-2`,
      title: (
        <LabelButton
          href={'/k8s/storageMaps/create/form'}
          label={t('Create storage map')}
          preText={t('Click on')}
        />
      ),
    },
    {
      id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-3`,
      subListStyleType: ListStyleType.LOWER_ALPHA,
      subTopics: () => [
        {
          id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-3a`,
          title: t('Name'),
        },
        {
          id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-3b`,
          title: t('Project'),
        },
        {
          id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-3c`,
          subListStyleType: ListStyleType.DESCRIPTIONS,
          subTopics: () => [
            {
              id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-3c-a`,
              title: t(
                'If your source provider is VMware, select a Source datastore and a Target storage class',
              ),
            },
            {
              id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-3c-b`,
              title: t(
                'If your source provider is Red Hat Virtualization, select a Source storage domain and a Target storage class',
              ),
            },
          ],
          title: t('Source provider'),
        },
        {
          id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-3d`,
          title: t('Target provider'),
        },
        {
          id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-3e`,
          title: t('Source storage'),
        },
        {
          id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-3f`,
          title: t('Target storage'),
        },
      ],
      title: t('Complete the fields:'),
    },
    {
      id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-4`,
      title: t(
        'Optionally, click Add to create additional storage mappings or to map multiple source data stores or storage domains to a single storage class.',
      ),
    },
    {
      id: `${STORAGE_MAP_STEPS_SUB_TOPIC_ID}-5`,
      title: t('Click Create. You can save the mapping for future use.'),
    },
  ],
  title: t('To create a storage mapping:'),
};
