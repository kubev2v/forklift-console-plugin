import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperience/types';

import { t } from '@utils/i18n';

export const selectVMWareMigrationTypeHelpTopic = (): LearningExperienceSubTopic => ({
  id: 'migrating-storage-map',
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: 'cold-migration',
      title: t(`A cold migration moves a shut-down virtual machine between hosts.`),
    },
    {
      id: 'warm-migration',
      title: t(
        `A warm migration moves an active VM between hosts with minimal downtime.  This is not live migration. A warm migration can only be used when migrating from VMware or Red Hat Virtualization.`,
      ),
    },
  ],
  title: t('Set a migration type:'),
});
