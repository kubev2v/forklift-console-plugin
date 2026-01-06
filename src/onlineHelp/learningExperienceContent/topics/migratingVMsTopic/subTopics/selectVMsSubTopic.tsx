import {
  type LearningExperienceSubTopic,
  ListStyleType,
} from 'src/onlineHelp/learningExperienceStructure/utils/types';

import { t } from '@utils/i18n';

export const selectVMsSubTopic = (): LearningExperienceSubTopic => ({
  id: 'migrating-select-vms',
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: 'migrating-select-vms-a',
      title: t(
        `Browse or search for the virtual machines you want to include in this migration plan from the selected source provider.`,
      ),
    },
    {
      id: 'migrating-select-vms-b',
      title: t(
        `Select the checkboxes next to the VMs you wish to migrate. You can select multiple VMs for a single plan.`,
      ),
    },
  ],
  title: t('Select the VMs you want to migrate to:'),
});
