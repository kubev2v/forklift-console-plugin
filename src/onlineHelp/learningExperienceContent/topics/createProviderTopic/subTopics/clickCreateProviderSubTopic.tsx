import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import { ProviderModelGroupVersionKind } from '@kubev2v/types';
import { t } from '@utils/i18n';

import LabelButton from '../../components/LabelButton';

export const clickCreateProviderSubTopic = (): LearningExperienceSubTopic => ({
  id: 'click-create-provider',
  title: (
    <LabelButton
      groupVersionKind={ProviderModelGroupVersionKind}
      isCreateForm
      label={t('Create provider')}
      preText={t('Click on')}
    />
  ),
});
