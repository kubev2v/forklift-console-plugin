import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const SELECT_MIGRATION_TYPE_SUB_TOPIC_ID = 'migrating-migration-type';

export const selectMigrationTypeSubTopic = (): LearningExperienceSubTopic => ({
  id: SELECT_MIGRATION_TYPE_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${SELECT_MIGRATION_TYPE_SUB_TOPIC_ID}-a`,
      title: t(`A cold migration moves a shut-down virtual machine between hosts.`),
    },
    {
      id: `${SELECT_MIGRATION_TYPE_SUB_TOPIC_ID}-b`,
      title: t(
        `A warm migration moves an active VM between hosts with minimal downtime. This is not live migration. A warm migration can only be used when migrating from VMware or Red Hat Virtualization.`,
      ),
    },
  ],
  title: t('Set a migration type:'),
});
