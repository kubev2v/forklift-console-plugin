import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { t } from '@utils/i18n';

export const selectMigrationTypeSubTopic = (): LearningExperienceSubTopic => ({
  id: 'migrating-migration-type',
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: 'migrating-migration-type-a',
      title: t(`A cold migration moves a shut-down virtual machine between hosts.`),
    },
    {
      id: 'migrating-migration-type-b',
      title: t(
        `A warm migration moves an active VM between hosts with minimal downtime. This is not live migration. A warm migration can only be used when migrating from VMware or Red Hat Virtualization.`,
      ),
    },
  ],
  title: t('Set a migration type:'),
});
