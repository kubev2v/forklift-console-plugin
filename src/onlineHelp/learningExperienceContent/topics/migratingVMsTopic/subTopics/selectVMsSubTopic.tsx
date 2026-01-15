import { type LearningExperienceSubTopic, ListStyleType } from 'src/onlineHelp/utils/types';

import { t } from '@utils/i18n';

const SELECT_VMS_SUB_TOPIC_ID = 'migrating-select-vms';

export const selectVMsSubTopic = (): LearningExperienceSubTopic => ({
  id: SELECT_VMS_SUB_TOPIC_ID,
  subListStyleType: ListStyleType.LOWER_ALPHA,
  subTopics: () => [
    {
      id: `${SELECT_VMS_SUB_TOPIC_ID}-a`,
      title: t(
        `Browse or search for the virtual machines you want to include in this migration plan from the selected source provider.`,
      ),
    },
    {
      id: `${SELECT_VMS_SUB_TOPIC_ID}-b`,
      title: t(
        `Select the checkboxes next to the VMs you wish to migrate. You can select multiple VMs for a single plan.`,
      ),
    },
  ],
  title: t('Select the VMs you want to migrate to:'),
});
