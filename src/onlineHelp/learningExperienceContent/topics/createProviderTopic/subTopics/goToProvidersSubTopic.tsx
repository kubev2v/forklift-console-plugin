import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import { ProviderModelGroupVersionKind } from '@forklift-ui/types';
import { t } from '@utils/i18n';

import LabelButton from '../../components/LabelButton';

export const goToProvidersSubTopic = (): LearningExperienceSubTopic => ({
  id: 'go-to-providers',
  title: (
    <LabelButton
      groupVersionKind={ProviderModelGroupVersionKind}
      label={t('Providers')}
      preText={t('Go to')}
    />
  ),
});
