import type { LearningExperienceSubTopic } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

export const reviewCreateProviderSubTopic = (): LearningExperienceSubTopic => ({
  id: 'review-create-provider',
  title: t('Review your details. If everything is good to go, click Create provider.'),
});
