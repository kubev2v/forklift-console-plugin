import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import { PlanModelGroupVersionKind } from '@forklift-ui/types';
import { t } from '@utils/i18n';

import LabelButton from '../../components/LabelButton';

export const createPlanSubTopic = (): LearningExperienceSubTopic => {
  return {
    id: 'create-plan',
    title: (
      <LabelButton
        groupVersionKind={PlanModelGroupVersionKind}
        label={t('Create plan')}
        isCreateForm
        preText={t('Click on')}
      />
    ),
  };
};
