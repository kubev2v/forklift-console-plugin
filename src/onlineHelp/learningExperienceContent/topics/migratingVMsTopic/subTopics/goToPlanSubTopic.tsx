import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import { PlanModelGroupVersionKind } from '@kubev2v/types';
import { t } from '@utils/i18n';

import LabelButton from '../../components/LabelButton';

export const goToPlanSubTopic = (): LearningExperienceSubTopic => ({
  id: 'go-to-plans',
  title: (
    <LabelButton
      groupVersionKind={PlanModelGroupVersionKind}
      label={t('Migration plans')}
      preText={t('Go to')}
    />
  ),
});
