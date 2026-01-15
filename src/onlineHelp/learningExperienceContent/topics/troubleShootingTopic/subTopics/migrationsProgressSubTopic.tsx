import HelpTitledContent from 'src/onlineHelp/components/HelpTitledContent';
import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { ForkliftTrans, t } from '@utils/i18n';

export const migrationProgressSubTopic = (): LearningExperienceSubTopic => ({
  id: 'migration-progress',
  subListStyleType: ListStyleType.DISC,
  subTopics: () => [
    {
      id: 'migration-check-progress',
      title: (
        <ForkliftTrans>
          Check the migration progress for a high-level overview of your virtual machine (VM)
          migration. To view the migration progress, go to the <strong>VirtualMachines</strong> tab
          on your migration plan's details page.
        </ForkliftTrans>
      ),
    },
    {
      id: 'migration-find-errors',
      title: t('You can typically find where the error is occurring here.'),
    },
    {
      id: 'migration-migrated',
      subListStyleType: ListStyleType.SQUARE,
      subTopics: () => [
        {
          id: 'migration-migrated-warm',
          title: (
            <HelpTitledContent
              title={t('Warm migration:')}
              content={t('VMs included in warm migrations migrate with minimal downtime.')}
            />
          ),
        },
        {
          id: 'migration-migrated-cold',
          title: (
            <HelpTitledContent
              title={t('Cold migration:')}
              content={t('VMs included in cold migrations are shut down during migration.')}
            />
          ),
        },
      ],
      title: t('Your VMs can be migrated in 2 different ways:'),
    },
  ],
  title: t('Migration progress'),
});
