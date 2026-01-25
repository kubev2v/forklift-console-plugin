import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { NetworkMapModelGroupVersionKind } from '@forklift-ui/types';
import { t } from '@utils/i18n';

import LabelButton from '../../components/LabelButton';

const NETWORK_MAP_STEPS_SUB_TOPIC_ID = 'network-map-steps';

export const networkMapStepsSubTopic: LearningExperienceSubTopic = {
  expandable: true,
  id: NETWORK_MAP_STEPS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.DECIMAL,
  subTopics: () => [
    {
      id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-1`,
      title: (
        <LabelButton
          href="/k8s/networkMaps/create/form"
          label={t('Create network map')}
          preText={t('Click on')}
        />
      ),
    },
    {
      id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-2`,
      title: (
        <LabelButton
          groupVersionKind={NetworkMapModelGroupVersionKind}
          label={t('Network maps')}
          preText={t('Go to')}
        />
      ),
    },
    {
      id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-3`,
      subListStyleType: ListStyleType.LOWER_ALPHA,
      subTopics: () => [
        {
          id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-3a`,
          title: t('Name'),
        },
        {
          id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-3b`,
          title: t('Project'),
        },
        {
          id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-3c`,
          title: t('Source provider'),
        },
        {
          id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-3d`,
          title: t('Target provider'),
        },
        {
          id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-3e`,
          title: t('Source networks'),
        },
        {
          id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-3f`,
          title: t('Target networks'),
        },
      ],
      title: t('Complete the fields:'),
    },
    {
      id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-4`,
      title: t(
        'Optionally, you can click Add to create additional network mappings or to map multiple source networks to multiple target networks (OpenShift network attachment definitions).',
      ),
    },
    {
      id: `${NETWORK_MAP_STEPS_SUB_TOPIC_ID}-5`,
      title: t('Click Create. You can save the mapping for future use.'),
    },
  ],
  title: t('To create a network mapping:'),
};
